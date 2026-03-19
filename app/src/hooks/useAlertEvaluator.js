import { useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Global Alert Evaluator: Runs in the background (e.g., from AdminLayout).
 * Fetches active alert rules and node stats independently, checking thresholds.
 */
const GlobalAlertEvaluator = () => {
  const firedRulesRef = useRef(new Set());

  useEffect(() => {
    const EVAL_INTERVAL = 15000; // Check every 15 seconds

    const evaluateAlerts = async () => {
      try {
        // 1. Fetch rules
        const rulesRes = await axios.get(
          `${import.meta.env.VITE_admin_server}/api/alerts/rules`,
          { withCredentials: true }
        );
        const rules = rulesRes.data || [];
        const activeRules = rules.filter((r) => r.enabled);

        if (activeRules.length === 0) return;

        // 2. Fetch node stats
        const statsRes = await axios.get(
          `${import.meta.env.VITE_admin_server}/api/proxmox/fetchNodeStats/pve`,
          { withCredentials: true }
        );
        const vmData = statsRes.data || [];

        // 3. Evaluate
        for (const rule of activeRules) {
          const vmsToCheck =
            rule.vm_filter === "all"
              ? vmData
              : vmData.filter((vm) => String(vm.vmid) === String(rule.vm_filter));

          for (const vm of vmsToCheck) {
            let metricValue = 0;

            switch (rule.metric) {
              case "cpu":
                metricValue = (vm.cpu || 0) * 100;
                break;
              case "memory":
                metricValue =
                  vm.maxmem > 0 ? ((vm.mem || 0) / vm.maxmem) * 100 : 0;
                break;
              case "disk":
                metricValue =
                  vm.maxdisk > 0 ? ((vm.disk || 0) / vm.maxdisk) * 100 : 0;
                break;
              default:
                continue;
            }

            let breached = false;
            switch (rule.condition) {
              case "gt":
                breached = metricValue > rule.threshold;
                break;
              case "lt":
                breached = metricValue < rule.threshold;
                break;
              case "eq":
                breached = Math.abs(metricValue - rule.threshold) < 0.5;
                break;
            }

            const fireKey = `${rule.id}-${vm.vmid}`;

            if (breached && !firedRulesRef.current.has(fireKey)) {
              firedRulesRef.current.add(fireKey);

              const severity = metricValue > 90 ? "critical" : "warning";
              const toastFn = severity === "critical" ? toast.error : toast.warn;
              toastFn(
                `⚠️ ${rule.name}: ${vm.name} — ${rule.metric.toUpperCase()} at ${metricValue.toFixed(1)}% (threshold: ${rule.threshold}%)`,
                { autoClose: 8000 }
              );

              // Post event to backend
              axios
                .post(
                  `${import.meta.env.VITE_admin_server}/api/alerts/events`,
                  {
                    rule_id: rule.id,
                    rule_name: rule.name,
                    vm_id: vm.vmid,
                    vm_name: vm.name,
                    metric: rule.metric,
                    metric_value: metricValue,
                    threshold: rule.threshold,
                    condition: rule.condition,
                    severity,
                  },
                  { withCredentials: true }
                )
                .catch((err) => console.error("Failed to record alert event:", err));

              // Clear the fire lock after 5 minutes so it can fire again
              setTimeout(() => {
                firedRulesRef.current.delete(fireKey);
              }, 5 * 60 * 1000);
            } else if (!breached && firedRulesRef.current.has(fireKey)) {
              firedRulesRef.current.delete(fireKey);
            }
          }
        }
      } catch (err) {
        // Silently fail on network error, keep trying
      }
    };

    // Initial run
    evaluateAlerts();
    
    // Setup background interval
    const interval = setInterval(evaluateAlerts, EVAL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
};

export default GlobalAlertEvaluator;
