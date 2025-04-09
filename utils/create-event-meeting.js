const { nylas } = require("../config/nylasConfig"); // Adjust the path as needed
const User = require("../models/user.model"); // Adjust the path as needed

exports.createMeeting = async ({
  userId,
  eventTitle,
  description,
  date,
  time,
}) => {
  const userInfo = await User.findById(userId);

  console.log(userInfo, "userInfo");
  console.log("userId", userId);

  // Combine date and time into an ISO 8601 string
  const dateTimeString = `${date}T${time}`;
  const startTime = new Date(dateTimeString); // Create a Date object (in milliseconds)
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour to start time

  // If you need Unix timestamps in seconds:
  const startTimeInSeconds = Math.floor(startTime.getTime() / 1000);
  const endTimeInSeconds = Math.floor(endTime.getTime() / 1000);

  if (!userInfo) {
    return null;
  }
  const eventCreateRes = await nylas.events.create({
    identifier: userInfo.grandId,
    requestBody: {
      title: eventTitle,
      description: description,
      when: {
        startTime: startTimeInSeconds,
        endTime: endTimeInSeconds,
      },
      conferencing: {
        autocreate: {},
        provider: "Google Meet",
      },
      participants: [],
    },
    queryParams: {
      calendarId: userInfo.grandEmail,
    },
  });

  if (!eventCreateRes) return null;

  return eventCreateRes;
};
