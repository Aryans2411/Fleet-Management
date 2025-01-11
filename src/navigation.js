import { Link } from "react-router-dom";

const initialNavigation = [
  { name: "Home", href: "/", key: "home" },
  { name: "Vehicle", href: "/vehicle", key: "vehicle" },
  { name: "Driver", href: "/driver", key: "driver" },
  { name: "Analytics", href: "/analytics", key: "analytics" },
];

function Navigation() {
  return (
    <nav>
      {initialNavigation.map((item) => (
        <Link
          key={item.key}
          to={item.href}
          className="rounded-md px-3 py-2 text-sm font-medium"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

export default Navigation;
