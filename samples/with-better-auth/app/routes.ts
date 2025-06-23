import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  ...prefix("api/auth", [
    route("*", "routes/api.auth.$.ts"),
  ]),
  // 404ハンドリング用のキャッチオールルート
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;