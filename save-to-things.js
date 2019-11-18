const open = require("open");
//
// set this to your json file
//
const data = require("./parsed-hitlist.json");
const qs = require("querystring");
const pEachSeries = require("p-each-series");

// set to true to bring log out tasks as they're sent to Things and bring
// Things to the foreground; you probably only want to do this if you're adding
// 1 task at a time. This is useful for addingg recurring tasks since Things
// doesn't have an API to do that and you must do that manually.
const DEBUG = true;

// If you want to customize the lists tasks will go in.
// NOTE: Things needs the lists to be created first; this won't do it for you!
// TODO: auto create areas/projects
const convertToList = name => {
  switch (name) {
    case "keep in touch":
      return { list: "Digital Chores", tags: ["keep in touch"] };
    default:
      return { list: "" };
  }
};

const convertToThingsFormat = t => {
  const task = { title: t.title };
  if (t.notes) task.notes = t.notes;
  // strip off hours or Things will set reminders
  if (t.startDate) task.when = t.startDate.split("T")[0];
  if (t.dueDate) task.deadline = t.dueDate.split("T")[0];
  if (t.tags && t.tags.length) task.tags = t.tags.join(",");
  if (t.subtasks && t.subtasks.length)
    task["checklist-items"] = t.subtasks
      .map(({ title, notes }) => {
        // FIXME: if there are nested subtasks, they are ignored
        return notes ? title + " " + notes : title;
      })
      .join("\n");
  // TODO: it would be better to create projects or areas when necessary
  if (t.createdDate) task["creation-date"] = t.createdDate;

  if (t.parentList) return { ...task, ...convertToList(t.parentList) };
  else return task;
};

const saveTask = async task => {
  const url =
    "things:///add?" +
    qs.stringify({ ...convertToThingsFormat(task), reveal: DEBUG });
  await open(url, { background: !DEBUG });
};

console.log("total tasks:", data.length);
const nonReccuringTasks = data.reduce((out, t) => {
  if (t.recurrence == null) out.push(t);
  return out;
}, []);
console.log("non recurring tasks:", nonReccuringTasks.length);

// save non-recurring tasks
pEachSeries(nonReccuringTasks, saveTask);

const reccuringTasks = data.reduce((out, t) => {
  if (t.recurrence != null) out.push(t);
  return out;
}, []);
console.log("recurring tasks:", reccuringTasks.length);

// NOTE: increment this one by one to manually input reccuring task data in things
const i = 0;

saveTask(reccuringTasks[i]);
console.log(reccuringTasks[i].title, reccuringTasks[i].recurrence);
