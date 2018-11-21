
// setup
var app = Application.currentApplication()
app.includeStandardAdditions = true
var Calendar = Application("Calendar")

// form for classlist
var response = app.displayDialog("Enter your class listing:", {
    defaultAnswer: "",
    withIcon: "note",
    buttons: ["Cancel", "Continue"],
    defaultButton: "Continue"
})

var classes = response.textReturned

// form for calendar
var response = app.displayDialog("Enter your calendar (email):", {
	defaultAnswer: "",
	withIcon: "note",
	buttons: ["Cancel", "Continue"],
	defaultButton: "Continue"
})

var email = response.textReturned


// convert class list string to list
var classlist = []
var classname = ""
for (var i = 0; i < classes.length; i++) {
	var classItem = classes[i]
	if (classItem == ","){
		classlist.push(classname)
		classname = ""
		continue
	}
	classname = classname + classItem
}
classlist.push(classname)


// remove dropped counter
var classlistreal = []
for (i = 0; i<classlist.length; i++){
	var attribute = classlist[i]
	if (attribute == "Dropped"){
		continue
	}
	classlistreal.push(attribute)
}
classlist = classlistreal

// create 2d list for each set of classes
var classes1 = []
var tempclass = []
for (var i = 0; i < classlist.length; i++) {
	var att = classlist[i]
	tempclass.push(att)
	if (i!=0 & (i+1)%5==0){
		classes1.push(tempclass)
		tempclass = []
	}
}


var marker = []

for (var i = 0; i<classes1.length; i++) {
	var checkday = classes1[i][3]
	if (checkday.length>3){
		marker.push(i)
	}
}

// 3, 4, 5, 6 - locs, room, days, time
for (var t = 0; t<marker.length; t++) {
	var current = classes1[marker[t]]
	var newcurrent = []	
	for (var l = 0; l<classes1[marker[t]].length; l++) {
		newcurrent.push(classes1[marker[t]][l])
	}
	
	// locations
	var location = current[2]
	var locations = []
	var locationcheck = ""
	location = location.replace(/\n/g, "")
	for (var k = 0; k<location.length; k++) {
		var st = location[k]
		if (location[k] == " ") {
			locations.push(locationcheck)
			locationcheck = ""
			continue
		}
		locationcheck +=st
	}
	locations.push(locationcheck)
	locationsreal = []
	for (var j = 0; j<locations.length/2; j++) {
		var currloc = locations[j] + " " + locations[j+2]
		locationsreal.push(currloc)
	}
	current[2] = locationsreal[0]
	newcurrent[2] = locationsreal[1]
	
	// days
	var days = current[3]
	day = []
	locationcheck = ""
	days = days.replace(/\n/g, "")
	for (var k = 0; k<days.length; k++) {
		var st = days[k]
		if (days[k] == " ") {
			day.push(locationcheck)
			locationcheck = ""
			continue
		}
		locationcheck +=st
	}
	day.push(locationcheck)
	current[3] = day[0]
	newcurrent[3] = day[1]
	
	// times
	var time = current[4]
	time = time.replace(/\n/g, "")
	times = []
	locationcheck = ""
	for (var k = 0; k<time.length; k++) {
		var st = time[k]
		if (time[k] == " " & time[k-1]!="-") {
			times.push(locationcheck)
			locationcheck = ""
			continue
		}
		locationcheck +=st
	}
	times.push(locationcheck)
	current[4] = times[0]
	newcurrent[4] = times[1]
	classes1.push(newcurrent)

}

// index through each of the lists to create calendar events
for (var i = 0; i < classes1.length; i++) {
	// get days
	var days = classes1[i][3]
	// get timings
	var times = classes1[i][4]
	
	// convert days to readable format for calendar days (0=sunday...)
	if (days=="MWF"){
		days = "135"
	}
	if (days == "MW"){
		days = "13"
	}
	if (days=="TTh"){
		days ="24"
	}
	if (days == "TTH"){
		days = "24"
	}
	if (days == "M") {
		days = "1"
	}
	if (days == "T") {
		days = "2"
	}
	if (days == "W") {
		days = "3"
	}
	if (days =="Th") {
		days = "4"
	}
	if (days =="TH") {
		days = "4"
	}
	if (days == "F") {
		days = "5"
	}
	
	// convert times to list values (11:00pm-12:00pm -> [[11,00],[12,00]]
	var timeset = []
	var timename = ""
	for (var j = 0; j<times.length; j++) {
		var timesx = times[j]
		if (timesx == "-"){
			timeset.push(timename)
			timename = ""
			continue
		}
		timename = timename + timesx
	}
	timeset.push(timename)
	var classtimeset = []
	for (var k = 0; k < timeset.length; k++) {
		var time = []
		var timel = ""
		for (var l = 0; l < timeset[k].length; l++) {
			var timepart = timeset[k][l]
			if (timepart ==":"){
				time.push(Number(timel))
				timel = ""
				continue
			}
			if (timepart + timeset[k][l+1] =="pm"){
				if (time[0]!=12){
					time[0]+=12
				}
				time.push(Number(timel))
				timel = ""
				continue
			}
			if (timepart + timeset[k][l+1] =="am"){
				time.push(Number(timel))
				timel = ""
				continue
			}
			timel += timepart
		}
		classtimeset.push(time)
	}
	
	// convert class name to list CS 313E: blah -> [cs 313e, classname]
	var fix = classes1[i][1]
	fixed = []
	fill = ""
	for (var m = 0; m<fix.length; m++){
		fixer = fix[m]
		if (fixer==":"){
			fixed.push(fill)
			continue
		}
		fill += fixer
	}
	fixed.push(fill)
	
	// create description for class -> classname (unique)
	var uniq = classes1[i][0]
	fixed[1] = fixed[1] + " (" + uniq + ")"
	
	// create calendar events for each of the class days
	for (var d = 0; d<days.length; d++){
		// get first day of class
		currDay = Number(days[d])
		
		// time class starts
		var hr = classtimeset[0][0]
		var min = classtimeset[0][1]
		
		// time class ends
		var hrEND = classtimeset[1][0]
		var minEND = classtimeset[1][1]
		
		// get todays date to index dates
		var eventStart = app.currentDate()
		eventStart.setDate(eventStart.getDate())
		
		// index date to next monday
		while(eventStart.getDay()!=0){
			eventStart.setDate(eventStart.getDate()+1)
		}
		
		// index date to day of class
		while (eventStart.getDay()!=currDay){
			eventStart.setDate(eventStart.getDate()+1)
		}	
		
		// set hours and minutes of class start/end
		eventStart.setHours(hr)
		eventStart.setMinutes(min)
		eventStart.setSeconds(0)
		var eventEnd = new Date(eventStart.getTime())
		eventEnd.setHours(hrEND)
		eventEnd.setMinutes(minEND)
		
		
		// upload to email's calendar with proper descriptions, times, room location
		var projectCalendars = Calendar.calendars.whose({name: email})
		var projectCalendar = projectCalendars[0]
		var event = Calendar.Event({summary: fixed[0], description: fixed[1],location: classes1[i][2], startDate: eventStart, endDate: eventEnd})
		projectCalendar.events.push(event)
		
		// display notification of events being added
		if (d==0){
			app.displayNotification(String(classes1[i][1]) + " " + "added to Calendar")
		}
		
		
	
	}
	

}



