import { firestore } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CONFIG_DOC = 'system_config';

export const fetchConfig = async () => {
  const configRef = doc(firestore, 'config', CONFIG_DOC);
  const configSnap = await getDoc(configRef);
  return configSnap.exists() ? configSnap.data() : {};
};

export const updateConfig = async (config) => {
  const configRef = doc(firestore, 'config', CONFIG_DOC);
  await setDoc(configRef, config, { merge: true });
}; 