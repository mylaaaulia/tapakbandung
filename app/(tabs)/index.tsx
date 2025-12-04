import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image as ExpoImage, ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEffect } from 'react';

// --- DEFINISI DATA KATEGORI ---
const FEATURES = [
  {
    icon: '🏞️',
    title: 'Jelajah Wisata',
    description: 'Menampilkan beragam destinasi wisata Yogyakarta, mulai dari lokasi populer hingga alternatif, lengkap dengan karakteristik dan daya tarik utamanya.',
    screen: 'lokasi',
    color: '#1E90FF',
  },
  {
    icon: '🎓',
    title: 'Akses Kampus & Fasilitas',
    description: 'Menyediakan informasi tentang kampus, fasilitas pendukung, serta area hunian seperti kos dan homestay untuk membantu mahasiswa memahami lingkungan sekitar.',
    screen: 'mahasiswa',
    color: '#4CAF50',
  },
  {
    icon: '🍽️',
    title: 'Kuliner & Nugas',
    description: 'Mengintegrasikan lokasi kuliner, kafe, dan tempat yang mendukung aktivitas belajar atau bekerja, lengkap dengan deskripsi singkat mengenai karakteristik setiap lokasi.',
    screen: 'mapwebview',
    color: '#FFC107',
  },
];

// --- KOMPONEN ANIMASI (TETAP SAMA) ---
const AnimatedView = ({ children, index }: { children: React.ReactNode, index: number }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 120, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(index * 120, withTiming(0, { duration: 600 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

// --- KOMPONEN KARTU INTERAKTIF ---
const InteractiveCard = ({ children, onPress, style }: { children: React.ReactNode, onPress: () => void, style: any }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} onPressIn={() => scale.value = withTiming(0.97)} onPressOut={() => scale.value = withTiming(1)}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

// --- KOMPONEN UTAMA HOMESCREEN ---
export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCardPress = () => {
    router.push('/jelajah');
  };

  const handleCTAPress = () => {
    router.push('/mapwebview'); // Menggunakan path absolut untuk menghilangkan error
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/bandung.jpg')}
        style={styles.fullScreenBackground}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.9)']}
          locations={[0, 0.5, 0.7, 1]}
          style={styles.gradientOverlay}
        >
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            {/* Header Content (Logo & Welcome Text) */}
            <ThemedView style={[styles.headerContent, { paddingTop: insets.top + 50 }]}>
              <AnimatedView index={0}>
                <ThemedText type="title" style={styles.headerTitle}>Selamat Datang di</ThemedText>
              </AnimatedView>
              <AnimatedView index={1}>
                <ExpoImage
                  source={require('../../assets/images/tapakbandung.png')}
                  contentFit='contain'
                  style={styles.headerLogo}
                />
              </AnimatedView>
            </ThemedView>

            {/* --- PENDAHULUAN APLIKASI --- */}
            <AnimatedView index={3}>
              <ThemedView style={styles.sectionContainer}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Panduan Komprehensif Lokasi Kota Bandung
                </ThemedText>
                <ThemedText style={styles.description}>
                  Tapak Bandung adalah <ThemedText type='defaultSemiBold'>super-app</ThemedText> berbasis peta yang dirancang untuk membantu pengguna menjelajahi berbagai lokasi penting di Kota Bandung. Aplikasi ini menyediakan informasi mengenai wisata, kuliner, fasilitas mahasiswa, serta titik-titik strategis lainnya secara terstruktur dan mudah diakses.
                </ThemedText>
              </ThemedView>
            </AnimatedView>

            {/* --- CALL TO ACTION (CTA) --- */}
            <AnimatedView index={4}>
              <TouchableOpacity onPress={handleCTAPress} style={styles.ctaButton} activeOpacity={0.8}>
                <ThemedText style={styles.ctaButtonText}>Mulai Jelajahi Peta Utama</ThemedText>
              </TouchableOpacity>
            </AnimatedView>

            {/* --- DAFTAR FITUR/KATEGORI (CARDS) --- */}
            <ThemedView style={styles.featuresContainer}>
              <ThemedText type="defaultSemiBold" style={styles.featuresHeader}>
                Jelajahi Berdasarkan Kategori:
              </ThemedText>
              {FEATURES.map((feature, i) => (
                <AnimatedView key={i} index={i + 5}>
                  <InteractiveCard
                    onPress={handleCardPress}
                    style={[styles.card, { borderColor: feature.color, borderLeftWidth: 5 }]}
                  >
                    <ThemedText style={styles.featureIcon}>{feature.icon}</ThemedText>
                    <ThemedView style={styles.cardTextContainer}>
                      <ThemedText type="subtitle" style={styles.featureTitle}>{feature.title}</ThemedText>
                      <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
                    </ThemedView>
                  </InteractiveCard>
                </AnimatedView>
              ))}
            </ThemedView>

            {/* --- FOOTER --- */}
            <ThemedView style={{ ...styles.sectionContainer, paddingTop: 16, paddingBottom: 40 }}>
              <ThemedText type="default" style={styles.footerText}>
                Aplikasi ini dibangun menggunakan React Native & Expo untuk PGPBL 2025
              </ThemedText>
            </ThemedView>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

// --- RESPONSIVE STYLING ---
const { width } = Dimensions.get('window');

// --- STYLING ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenBackground: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40, // Extra padding at the bottom
  },
  headerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 20, // Space after logo
  },
  headerLogo: {
    height: width * 0.45, // Ukuran logo diperbesar
    width: width * 0.45,
    shadowOffset: { height: 0, width: 0 },
    shadowRadius: 30, // Radius diperbesar untuk glow yang lebih solid
  },
  headerTitle: {
    color: '#000000ff',
    fontSize: width * 0.055,
    marginBottom: 8, // Menambah jarak ke logo di bawahnya
    fontFamily: 'Poppins_300Light_Italic', // Menggunakan custom font yang sudah dimuat
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: '#FFD700',
    fontSize: width * 0.1,
    fontWeight: '900',
    textAlign: 'center',
  },
  sectionContainer: {
    gap: 5,
    padding: width * 0.06,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  description: {
    fontSize: width * 0.04,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000000ff',
  },
  ctaButton: {
    backgroundColor: '#4bb4c4ff',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: width * 0.06,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#000000ff',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  featuresContainer: {
    gap: 16,
    paddingHorizontal: width * 0.06,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  featuresHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: width * 0.05,
    borderRadius: 12,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderColor: '#EEEEEE',
    borderWidth: 1,
  },
  cardTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    gap: 4,
  },
  featureIcon: {
    fontSize: width * 0.08,
    marginTop: 0,
    paddingTop: 10,
  },
  featureTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: width * 0.035,
    lineHeight: 20,
    opacity: 0.8,
  },
  footerText: {
    opacity: 0.5,
    textAlign: 'center',
    fontSize: 12,
  }
});
