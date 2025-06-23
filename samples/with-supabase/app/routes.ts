import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  
  // 認証関連のルート
  route("auth/login", "routes/auth.login.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  route("auth/logout", "routes/auth.logout.tsx"),
  
  // 保護されたルート
  route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
