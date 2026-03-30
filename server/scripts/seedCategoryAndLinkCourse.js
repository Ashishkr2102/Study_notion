require("dotenv").config()
const mongoose = require("mongoose")
const Category = require("../models/Category")
const Course = require("../models/Course")

async function main() {
  await mongoose.connect(process.env.MONGODB_URL)

  const categoryName = "Java Development"
  const categoryDescription = "Default category seeded for catalog"

  // Create category if missing
  let category = await Category.findOne({ name: categoryName })
  if (!category) {
    category = await Category.create({
      name: categoryName,
      description: categoryDescription,
    })
  }

  // Link the existing published course (if found) to the category
  const course = await Course.findOne({ courseName: "JAVA DEVELOPMENT" })
  if (!course) {
    console.log("No course found for name: JAVA DEVELOPMENT")
    return
  }

  course.category = category._id
  await course.save()

  // Ensure category.courses contains the course id
  const alreadyLinked = category.courses.some(
    (id) => id.toString() === course._id.toString()
  )
  if (!alreadyLinked) {
    category.courses.push(course._id)
    await category.save()
  }

  console.log("Seed complete:", {
    categoryId: category._id.toString(),
    courseId: course._id.toString(),
  })
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await mongoose.disconnect()
  })

