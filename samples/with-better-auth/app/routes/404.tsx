import { Link } from "react-router";

export default function NotFound() {
  // 特定のパスは静的に空のレスポンスを返す
  if (typeof window === "undefined") {
    const request = new Request("http://localhost");
    if (request.url.includes("/.well-known/") || 
        request.url.includes("/favicon.ico")) {
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">ページが見つかりませんでした</p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}