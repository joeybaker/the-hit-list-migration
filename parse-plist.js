const plist = require("simple-plist");
const fs = require("fs");

// README
//
// 1. set the input filename
//
// const fileName = "./The Hit List 2019-10-13.thlbackup";
//
//
// 2. set the output filename
//
// const outputFilename = "parsed-hitlist-mental-models.json";
//
//
//
//
const js = plist.readFileSync(fileName, "utf8");
const data = js.PFEntities;

const recurrenceTypeToInterval = t => {
  switch (t) {
    case 1:
      return "daily";
    case 2:
      return "weekly";
    case 3:
      return "monthly";
    case 4:
      return "yearly";
    default:
      return "unknown";
  }
};

const parseTask = t => {
  const cloned = { ...t };
  if (t.notes) cloned.notes = data.TaskNotes[t.notes].string;
  if (t.parentList) cloned.parentList = data.List[t.parentList].title;

  if (t.recurrence) {
    const recurrence = plist.parse(t.recurrence.rule).$objects;

    // recurrenceType = 1 = every recurrenceInterval days
    // recurrenceType = 2 = every recurrenceInterval weeks; specific days of the week; days listed as numbers in $objects
    // recurrenceType = 3 = every recurrenceInterval months; if repeatAfterCompletion = false numbers in $objects first indexed number is day to repeat
    // recurrenceType = 4 = every recurrenceInterval years; if repeatAfterCompletion = false numbers in $objects first indexed number is month and second is day to repeat
    //
    // repeatAfterCompletion: bool
    // hasDueDate: bool
    // timeIntervalBetweenStartAndDueDates: number

    // type: gap | postCompletion <--- repeatAfterCompletion
    // interval: daily | weekly | monthly | yearly <--- recurrenceType
    // postCompletionTimeInterval: number <--- recurrenceInterval (only for type == postCompletion)
    // every: number[] <--- only for type == regular
    // hasDueDate: bool
    // timeIntervalBetweenStartAndDueDates: number
    //
    // note: won't handle ending of recurrence
    const interval = recurrenceTypeToInterval(recurrence[1].recurrenceType);
    const type = recurrence[1].repeatAfterCompletion ? "postCompletion" : "gap";
    const postCompletionTimeInterval =
      type === "postCompletion" ? recurrence[1].recurrenceInterval : null;
    const every =
      type === "gap"
        ? recurrence.reduce(
            (out, i) => (typeof i === "number" ? [...out, i] : out),
            []
          )
        : null;
    const { hasDueDate, timeIntervalBetweenStartAndDueDates } = recurrence[1];
    cloned.recurrence = {
      type,
      interval,
      postCompletionTimeInterval,
      every,
      hasDueDate,
      timeIntervalBetweenStartAndDueDates
    };
  }

  if (t.tags && t.tags.length) {
    cloned.tags = t.tags.map(tag => data.Tag[tag].title);
    // strip out tags from the task title since they're just … tags
    cloned.title = t.title
      .replace(/^\/(\w+)/g, "$1:")
      .replace(/\/\w+/g, "")
      .trim();
  }

  if (t.subtasks && t.subtasks.length) {
    cloned.subtasks = t.subtasks.map(id => parseTask(data.Task[id]));
  }

  return cloned;
};

const parsedTasks = Object.values(data.Task).reduce((out, t) => {
  if (!t.status) {
    const task = parseTask(t);
    // sub tasks are handled separately
    if (task.parentTask == null) out.push(task);
  }
  return out;
}, []);

fs.writeFileSync(outputFilename, JSON.stringify(parsedTasks, null, 2), "utf8");
