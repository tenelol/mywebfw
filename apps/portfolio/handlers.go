// apps/portfolio/handlers.go
package portfolio

import (
	"net/http"

	"mywebfw/framework"
)

type Project struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
    URL         string `json:"url"`
}


var projects = []Project{
    {
        ID:          1,
        Name:        "nixos-dotfiles",
        Description: "my nix serverized configuration",
	URL:         "https://github.com/tenelol/nixos-dotfiles",
    },
    {
        ID:          2,
        Name:        "My Framework",
        Description: "My portfolio configuration with self-made framework",
	URL:         "https://github.com/tenelol/mywebfw", 
    },
    // 必要なだけ続ける
}


// GET /api/projects
func ProjectsAPI(ctx *framework.Context) {
	framework.JSON(ctx, http.StatusOK, projects)
}

