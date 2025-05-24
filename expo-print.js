import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const exportAsPdf = async (note) => {
  const htmlContent = `
    <h1>${note.title}</h1>
    <p>${note.content}</p>
  `;

  const { uri } = await Print.printToFileAsync({ html: htmlContent });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  } else {
    Alert.alert('Error', 'Sharing is not available on this device');
  }
};
