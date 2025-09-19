import PushNotification from "react-native-push-notification";

export const configureNotifications = () => {
  // Create channel for Android
  PushNotification.createChannel(
    {
      channelId: "default-channel-id",
      channelName: "Default Channel",
      channelDescription: "A default channel for notifications",
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );

  // Configure notifications
  PushNotification.configure({
    onRegister: function (token) {
      console.log("TOKEN:", token);
    },
    onNotification: function (notification) {
      console.log("LOCAL NOTIFICATION:", notification);
      notification.finish(PushNotification.FetchResult.NoData);
    },
    requestPermissions: true,
  });
};
