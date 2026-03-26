import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

export function normalizeTel(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}

export async function openDialer(phone: string) {
  const n = normalizeTel(phone);
  if (!n) return;
  const url = `tel:${n}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Phone', n);
  }
}

export async function openSms(phone: string, body = 'I am safe.') {
  const n = normalizeTel(phone);
  if (!n) return;
  const encoded = encodeURIComponent(body);
  const url =
    Platform.OS === 'ios' ? `sms:${n}&body=${encoded}` : `sms:${n}?body=${encoded}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('SMS', n);
  }
}
