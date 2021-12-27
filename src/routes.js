import Home from "pages/Home";
import NotFound from "pages/NotFound";
import Projects from "pages/projects";
import DetailProject from "pages/projects/[id].jsx";

export const routes = [
  {
    path: "/projects",
    component: Projects,
    exact: true,
  },
  {
    path: "/projects/:id",
    component: DetailProject,
    exact: true,
  },
  {
    path: "*",
    component: NotFound,
  },
];
