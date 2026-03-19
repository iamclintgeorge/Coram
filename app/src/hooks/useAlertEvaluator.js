import { useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

/**
 * Hook that evaluates alert rules against polled VM data.
 * Runs alongside the polling hook — checks rules every time new VM data arrives.
 *
 * @param {Array} vmData - Array of VM stats from the polling hook
 * @param {Array} rules - Array of alert rules from the backend
 * @param {boolean} enabled - Whether to run evaluation
 */
const useAlertEvaluator = (vmData, rules, enabled = true) => {
  const firedRulesRef = useRef(new Set()); // Track which rules have fired recently to avoid spam

  useEffect(() => {
    if (!enabled || !vmData || !rules || rules.length === 0) return;

    const activeRules = rules.filter((r) => r.enabled);

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
              vm.maxmem > 0
                ? ((vm.mem || 0) / vm.maxmem) * 100
                : 0;
            break;
          case "disk":
            metricValue =
              vm.maxdisk > 0
                ? ((vm.disk || 0) / vm.maxdisk) * 100
                : 0;
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

          // Show toast notification
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
          // Clear the lock when condition resolves
          firedRulesRef.current.delete(fireKey);
        }
      }
    }
  }, [vmData, rules, enabled]);
};

export default useAlertEvaluator;
