import { StatusBar } from 'expo-status-bar';
import {StyleSheet, View, Platform} from 'react-native';
import ImageViewer from "./components/ImageViewer";
import Button from "./components/Button";
import React, {useRef, useState} from "react";
import * as ImagePicker from 'expo-image-picker';
import IconButton from "./components/IconButton";
import CircleButton from "./components/CircleButton";
import EmojiPicker from "./components/EmojiPicker";
import EmojiList from "./components/EmojiList";
import EmojiSticker from "./components/EmojiSticker";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import domtoimage from 'dom-to-image';

const PlaceholderImage = require('./assets/images/placeholder.png');

export default function App() {
  const imageRef = useRef();
  const [imageEditable, setImageEditable] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isStickerPickerModalVisible, setIsStickerPickerModalVisible] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState(null);
  const [mediaPermissionStatus, mediaPermissionRequest] = MediaLibrary.usePermissions();

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setImageEditable(true);
    } else {
      alert('You did not select any image.');
    }
  };

  const onReset = () => {
    setImageEditable(false);
    setPickedEmoji(null);
  };

  const onAddSticker = () => {
    setIsStickerPickerModalVisible(true);
  };

  const onStickerPickerModalClose = () => {
    setIsStickerPickerModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert("Saved!");
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement('a');
        link.download = 'result.jpeg';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (mediaPermissionStatus === null) {
    mediaPermissionRequest();
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer placeholderImageSource={PlaceholderImage} selectedImage={selectedImage} />
          {pickedEmoji !== null ? <EmojiSticker imageSize={40} stickerSource={pickedEmoji} /> : null}
        </View>
      </View>
      { imageEditable ? (
          <View style={styles.editsContainer}>
            <View style={styles.editsRow}>
              <IconButton icon="refresh" label="Reset" onPress={onReset} />
              <CircleButton onPress={onAddSticker} />
              <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
            </View>
          </View>
      ) : (
          <View style={styles.footerContainer}>
            <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
            <Button label="Use this photo" onPress={() => setImageEditable(true)} />
          </View>
      )}
      <EmojiPicker isVisible={isStickerPickerModalVisible} onClose={onStickerPickerModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onStickerPickerModalClose} />
      </EmojiPicker>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  editsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  editsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
