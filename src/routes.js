import Home from "pages/Home";
import NotFound from "pages/NotFound";
import Projects from "pages/projects";
import JoinPool from "pages/projects/JoinPool";
import DetailProject from "pages/projects/[id].jsx";

export const routes = [
  {
    path: "/",
    component: Home,
    exact: true,
  },
  {
    path: "/projects",
    component: Projects,
    exact: true,
  },
  {
    path: "/projects/:slug",
    component: DetailProject,
    exact: true,
  },
  {
    path: "/projects/:slug/join",
    component: JoinPool,
    exact: true,
  },
  {
    path: "*",
    component: NotFound,
  },
];
