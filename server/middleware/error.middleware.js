module.exports = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  if (process.env.NODE_ENV === "production") {
    res.status(500).send("Something went wrong");
  } else {
    res.status(500).send(err.message);
  }
};
