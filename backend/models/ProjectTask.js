import mongoose from "mongoose";

const ProjectTaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    // Task title shown on Gantt
    name: {
      type: String,
      required: true,
      trim: true,
    },



    // Optional description
    description: {
      type: String,
      default: "",
    },

    // Dates for Gantt bar
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // % Completed (0–100)
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Planned / In Progress / Completed / Delayed / On Hold
    status: {
      type: String,
      enum: ["planned", "In Progress", "completed", "delayed", "On Hold", "in-progress"],
      default: "Planned",
    },

    // Optional: parent task for grouping (Phase → Subtasks)
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectTask",
      default: null,
    },

    // Dependencies: array of other taskIds
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectTask",
      },
    ],

    // Order in list (for Gantt row ordering)
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Who created / updated (optional)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Basic validation: startDate < endDate
ProjectTaskSchema.pre("save", function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    return next(new Error("startDate cannot be after endDate"));
  }
  next();
});

const ProjectTask = mongoose.model("ProjectTask", ProjectTaskSchema);
export default ProjectTask;
