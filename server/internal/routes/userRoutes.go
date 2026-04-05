package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/iamclintgeorge/Coram/internal/controllers"
	"github.com/iamclintgeorge/Coram/internal/middleware"
)

func UserRoutes(rg *gin.RouterGroup) {
//     rg.POST("/login", controllers.Login)
//     rg.POST("/logout", controllers.LogoutController)
//     rg.GET("/check-auth", controllers.CheckAuthController)

	rg.GET("/check-root", controllers.CheckRoot)
     rg.POST("/login", controllers.LoginController)
     rg.POST("/signup", controllers.SignupController)
	rg.GET("/check-auth", middleware.AuthMiddleware(), middleware.CheckAuth)
	rg.POST("/signout", controllers.LogoutController)
	rg.GET("/get-users", controllers.FetchUsers)
	rg.DELETE("/delete-users/:id", controllers.DeleteUsers)
	rg.POST("/update-vm-assign", controllers.UpdateVMAssign)
}
