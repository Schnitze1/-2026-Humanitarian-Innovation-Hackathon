import { NavLink } from "react-router-dom";

const STEPS = [
  { path: "/setup", label: "Setup", step: 1 },
  { path: "/upload", label: "Upload", step: 2 },
  { path: "/generate", label: "Generate", step: 3 },
  { path: "/review", label: "Review", step: 4 },
  { path: "/disclosure", label: "Disclosure", step: 5 },
];

function WorkflowSteps({ currentPath }) {
  const currentIndex = STEPS.findIndex((s) => s.path === currentPath);

  return (
    <ol className="workflow-steps" aria-label="Report workflow stages">
      {STEPS.map((item, index) => {
        let state = "upcoming";
        if (index < currentIndex) state = "complete";
        if (index === currentIndex) state = "current";

        return (
          <li key={item.path} className={`workflow-steps__item is-${state}`}>
            <NavLink to={item.path} className="workflow-steps__link">
              <span className="workflow-steps__number" aria-hidden="true">
                {item.step}
              </span>
              <span className="workflow-steps__label">{item.label}</span>
            </NavLink>
          </li>
        );
      })}
    </ol>
  );
}

export default WorkflowSteps;
export { STEPS };
