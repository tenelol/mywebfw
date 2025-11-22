// framework/static.go
package framework

import (
    "net/http"
)

// Static returns a handler that serves static files from dir
// with cache-control headers to prevent stale caching.
func Static(dir string) http.Handler {
    fs := http.FileServer(http.Dir(dir))
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // キャッシュ制御ヘッダーを付与
        w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
        w.Header().Set("Pragma", "no-cache")
        w.Header().Set("Expires", "0")

        // 注意：静的ファイル／ディレクトリのパス処理
        // オプションで、特定拡張子だけキャッシュさせる、等も可能
        fs.ServeHTTP(w, r)
    })
}

