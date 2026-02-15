import { Image } from "react-native";

const avatarImages = {
    avatar1: require("../assets/avatars/avatar1.png"),
    avatar2: require("../assets/avatars/avatar2.png"),
    avatar3: require("../assets/avatars/avatar3.png"),
    avatar4: require("../assets/avatars/avatar4.png"),
    avatar5: require("../assets/avatars/avatar5.png"),
    avatar6: require("../assets/avatars/avatar6.png"),
    avatar7: require("../assets/avatars/avatar7.png"),
    avatar8: require("../assets/avatars/avatar8.png"),
    avatar9: require("../assets/avatars/avatar9.png"),
    avatar10: require("../assets/avatars/avatar10.png"),
    avatar11: require("../assets/avatars/avatar11.png"),
    avatar12: require("../assets/avatars/avatar12.png"),
};

export default function AvatarComponent({ avatar, width = 24 }) {
    console.log(width);
    return (
        <Image
            source={avatarImages[avatar] || ""}
            style={{
                width: `${width}`,
                height: `${width}`,
                borderRadius: 12,
                marginRight: 8,
                contentFit: "cover",
            }}
        />
    );
}
