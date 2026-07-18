function Card({ children, className = "", as: Tag = "section", ...rest }) {
  const classes = ["card", className].filter(Boolean).join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export default Card;
