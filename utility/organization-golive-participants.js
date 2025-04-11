const User = require("../models/user.model");
const OrganizationEventModel = require("../models/organizationGoLive.model"); // Assuming the Event model exists
const { nylas } = require("../config/nylasConfig");

exports.organizationGoLiveParticipantsManage = async (
  userId,
  organizationGoLiveId
) => {
  try {
    // Step 1: Validate input
    if (!userId || !organizationGoLiveId) {
      throw new Error("Both userId and organizationGoLiveId are required.");
    }

    // Step 2: Retrieve user data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Step 3: Retrieve event/organization data
    const event = await OrganizationEventModel.findById(organizationGoLiveId);
    if (!event) {
      throw new Error("Organization or Event not found.");
    }

    const owner = await User.findById(event.organizationID);

    // Step 4: Check if the user is already a participant
    if (!event.participants.includes(userId)) {
      // Step 5: Add the userId to the participants array
      const updatedEvent = await OrganizationEventModel.findByIdAndUpdate(
        organizationGoLiveId,
        { $push: { participants: userId } }, // Add userId to the participants array
        { new: true } // Return the updated document
      );

      const participantsPushToCalender = await nylas.events.update({
        identifier: owner.grandId,
        eventId: event.meetingId,
        requestBody: {
          participants: [
            {
              name: user.fullName,
              email: user.email,
            },
          ],
        },
        queryParams: {
          calendarId: owner.grandEmail,
        },
      });

      // Step 6: Return the updated event
      return {
        success: true,
        message: "User added to participants successfully.",
        event: updatedEvent,
      };
    }

    return {
      success: true,
      message: "User added to participants successfully.",
    };
  } catch (error) {
    // Step 7: Handle errors
    console.error(
      "Error in organizationGoLiveParticipantsManage:",
      error.message
    );
    return null;
  }
};
