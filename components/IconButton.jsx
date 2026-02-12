import { Image, Pressable } from "react-native";

export default function IconButton({ onBtnPress, iconPath, alt }) {
    return (
        <Pressable
            onPress={onBtnPress}
            style={{ width: 35, height: 35 }}
            className=" rounded-full"
        >
            <Image
                source={iconPath}
                alt={alt}
                style={{
                    width: "100%",
                    height: "100%",
                }}
                contentFit="cover"
            />
        </Pressable>
    );
}
