const slugify = (text) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Ensures the slug is unique for the Product collection, appending -2, -3... if needed.
const uniqueProductSlug = async (Product, name, excludeId = null) => {
  const base = slugify(name) || "product";
  let slug = base;
  let counter = 2;
  // eslint-disable-next-line no-await-in-loop
  while (
    await Product.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

module.exports = { slugify, uniqueProductSlug };
