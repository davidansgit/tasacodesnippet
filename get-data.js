import dbconnect from "./dbconnect.js";
import Category from "./src/models/Categories.js";
import Subcategory from "./src/models/Subcategories.js";
import Skill from "./src/models/Skills.js";

async function getData() {
  try {
    await dbconnect();

    console.log("=== CATEGORIES ===");
    const categories = await Category.find({}).select("name slug").sort("name");
    categories.forEach((cat) => console.log(`- ${cat.name} (${cat.slug})`));

    console.log("\n=== SUBCATEGORIES ===");
    const subcategories = await Subcategory.find({})
      .select("name slug")
      .sort("name");
    subcategories.forEach((sub) => console.log(`- ${sub.name} (${sub.slug})`));

    console.log("\n=== SKILLS (first 30) ===");
    const skills = await Skill.find({})
      .select("name slug")
      .sort("name")
      .limit(30);
    skills.forEach((skill) => console.log(`- ${skill.name} (${skill.slug})`));

    const totalSkills = await Skill.countDocuments();
    console.log(`\nTotal skills: ${totalSkills}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

getData();
