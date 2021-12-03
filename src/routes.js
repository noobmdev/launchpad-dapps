import Home from "pages/Home";
import NotFound from "pages/NotFound";

export const routes = [
  {
    path: "/",
    component: Home,
    exact: true,
  },
  {
    path: "*",
    component: NotFound,
  },
];
