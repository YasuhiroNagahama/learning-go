package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type ApiResponse struct {
	Results    []Movie `json:"results"`
	TotalPages int     `json:"total_pages"`
	Image      string  `json:"image`
}

type Movie struct {
	Title         string `json:"title"`
	OriginalTitle string `json:"original_title"`
	Overview      string `json:"overview"`
	Id            int    `json:"id"`
	PosterPath    string `json:"poster_path"`
	ReleaseDate   string `json:"release_date"`
}

// TMDB APIから映画の一覧を取得するハンドラ
func getMoviesHandler(w http.ResponseWriter, r *http.Request) {
	// クエリパラメーターからページ番号を取得
	pageNumber := r.URL.Query().Get("page")
	if pageNumber == "" {
		pageNumber = "1" // デフォルトのページ番号を設定
	}

	apiKey := "aa8484df9849b0589dadccec1fbb995b"
	url := fmt.Sprintf("https://api.themoviedb.org/3/movie/now_playing?api_key=%s&language=ja-JP&page=%s", apiKey, pageNumber)

	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Failed to fetch movies", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var apiResponse ApiResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		http.Error(w, "Failed to decode movies response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apiResponse.Results)
}

func getTotalPagesHandler(w http.ResponseWriter, r *http.Request) {
	apiKey := "aa8484df9849b0589dadccec1fbb995b"
	url := fmt.Sprintf("https://api.themoviedb.org/3/movie/now_playing?api_key=%s&language=ja-JP", apiKey)

	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Failed to fetch total pages", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var apiResponse ApiResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		http.Error(w, "Failed to decode  total pages response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apiResponse.TotalPages)
}

func getSearchHandler(w http.ResponseWriter, r *http.Request) {
	// クエリパラメーターからページ番号を取得
	inputString := r.URL.Query().Get("search")

	apiKey := "aa8484df9849b0589dadccec1fbb995b"
	url := fmt.Sprintf("https://api.themoviedb.org/3/search/movie?api_key=%s&language=ja-JP&query=%s", apiKey, inputString)

	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Failed to fetch search", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var apiResponse ApiResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		http.Error(w, "Failed to decode search response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apiResponse.Results)
}

func main() {
	// ルートとハンドラ関数を定義
	http.HandleFunc("/api/movies", getMoviesHandler)
	http.HandleFunc("/api/total_pages", getTotalPagesHandler)
	http.HandleFunc("/api/search", getSearchHandler)

	// 静的ファイルのディレクトリを取得
	staticDir := "./"

	// 静的ファイルを提供するためのハンドラを作成
	fs := http.FileServer(http.Dir(staticDir))

	// ハンドラをルートURLにマップ
	http.Handle("/", fs)

	// // サーバーをポート8000で起動
	log.Println("Starting server on :8000...")

	// 8000番ポートでサーバを開始
	http.ListenAndServe(":8000", nil)
}
