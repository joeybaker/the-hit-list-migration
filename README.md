# The Hit List Migration

I've love [The Hit List](http://www.karelia.com/products/the-hit-list/mac.html) for many many years, but it's not getting any updates, and its sync service has become increasingly buggy (duplicating tasks; frequently needing a full re-sync). So I went on the search for a new TODO application and settled on [Things](https://culturedcode.com/things/).

Things is actually updated! It's sync seems to be rock solid! It even keeps the badge count updated without having to open the app! It's keyboard shortcuts on the Mac aren't quite as good, but absolutely workable.

Things has some auto-import abilities, but unsurprisingly, nothing existed for The Hit List. So, I wrote a couple of scripts to get that done. This are very very _hacky_. I didn't take the time to polish them because I (hope) they're one-time-use and I'll never have to see them again. Use at your own risk.

## `parse-plist.js`

This is intended to take a `*.thlbackup` file (File > Backup) in THL, and turn it into a generic `.json` file. You could then take this json, and with another script import your data to any app of your choice.

You'll have to go into the file and add your input and output filenames.

## `save-to-things.js`

This takes a json file generated from `parse-plist.js` (you'll have to put in the filepath inside this file), and saves all your TODOs into Things via their custom URL scheme API. I found this to be more flexible and documented than their applescript API.

A major caveat is that Things does not have a way to import recurring task data. You'll have to manually add that for all your recurring tasks. To assist with that, there's a `DEBUG` mode and the recurring tasks are saved separately. I just went through one-by-one and manually inputed the recurrence data. This requires tweaking the script many times and re-running.

## TODO

I'll almost certainly never do this, but to make this cleaner, we could:

- [ ] use [yargs](https://www.npmjs.com/package/yargs) or similar so we don't have to tweak the script files
- [ ] Things is actually just a SQLLite database. Instead of using their URL API, we could write directly to that DB. We'd even be able to get recurrence data. I didn't want to go through the hassle of figuring out the whole schema though.
- [ ] Are there other TODO apps you want to import to? Write a script!
- [ ] There are no tests here. Yup.
