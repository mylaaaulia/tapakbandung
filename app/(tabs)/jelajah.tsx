import { ThemedText } from '@/components/themed-text';
import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { onValue, ref, remove } from 'firebase/database';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    LayoutAnimation,
    Linking,
    Platform,
    RefreshControl,
    SectionList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebaseConfig';

// Interfaces remain the same
interface Location {
    id: string;
    name: string;
    description: string;
    category: string;
    coordinates: string;
    accuracy: string;
    details: string;
}

interface Section {
    title: string;
    data: Location[];
}

// Custom hook for animation
const useAnimatedRotation = (isExpanded: boolean) => {
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(rotation, {
            toValue: isExpanded ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [isExpanded]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    return spin;
};

// Location Info Row Component
const InfoRow = ({ icon, label, value }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Feather name={icon} size={16} color="#4A5568" style={{ marginRight: 8 }} />
        <View style={{flex: 1}}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            <ThemedText style={styles.value}>{value}</ThemedText>
        </View>
    </View>
);

// Action Button Component
const ActionButton = ({ icon, label, color, onPress }: { icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string; color: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionBtn}>
        <MaterialIcons name={icon} size={22} color={color} />
        <ThemedText style={[styles.actionBtnText, { color }]}>{label}</ThemedText>
    </TouchableOpacity>
);


// Main Card Component
const LocationCard = ({ item, isExpanded, onToggle, onEdit, onDelete, onNavigate }: {
    item: Location;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: (item: Location) => void;
    onDelete: (id: string) => void;
    onNavigate: (coordinates: string) => void;
}) => {
    const spin = useAnimatedRotation(isExpanded);

    return (
        <TouchableOpacity onPress={onToggle} activeOpacity={0.9} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="location-pin" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <ThemedText style={styles.name}>{item.name}</ThemedText>
                    <ThemedText style={styles.description} numberOfLines={1} ellipsizeMode="tail">
                        {item.description}
                    </ThemedText>
                </View>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Feather name="chevron-right" size={24} color="#A0AEC0" />
                </Animated.View>
            </View>

            {isExpanded && (
                <View style={styles.expandBox}>
                    <View style={styles.badge}>
                        <ThemedText style={styles.badgeText}>{item.category}</ThemedText>
                    </View>

                    <InfoRow icon="align-left" label="Deskripsi" value={item.description} />
                    <InfoRow icon="map-pin" label="Koordinat" value={item.coordinates} />
                    {item.accuracy && <InfoRow icon="compass" label="Akurasi" value={item.accuracy} />}
                    {item.details && <InfoRow icon="info" label="Informasi Tambahan" value={item.details} />}

                    <View style={styles.actionRow}>
                        <ActionButton icon="directions" label="Navigasi" color="#3182CE" onPress={() => onNavigate(item.coordinates)} />
                        <ActionButton icon="edit" label="Ubah" color="#DD6B20" onPress={() => onEdit(item)} />
                        <ActionButton icon="delete" label="Hapus" color="#E53E3E" onPress={() => onDelete(item.id)} />
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};


export default function JelajahScreen() {
    const [allSections, setAllSections] = useState<Section[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const pointsRef = ref(db, 'points/');
        const unsubscribe = onValue(pointsRef, (snapshot) => {
            const data = snapshot.val();
            const arr: Location[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];

            const grouped = arr.reduce((acc, loc) => {
                const category = loc.category || 'Uncategorized';
                if (!acc[category]) acc[category] = [];
                acc[category].push(loc);
                return acc;
            }, {} as { [key: string]: Location[] });

            const sectionData = Object.keys(grouped).sort().map(cat => ({ title: cat, data: grouped[cat] }));

            setAllSections(sectionData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredSections = useMemo(() => {
        if (!searchQuery) {
            return allSections;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return allSections
            .map(section => {
                const filteredData = section.data.filter(item =>
                    item.name.toLowerCase().includes(lowercasedQuery) ||
                    item.description.toLowerCase().includes(lowercasedQuery) ||
                    item.category.toLowerCase().includes(lowercasedQuery)
                );
                return { ...section, data: filteredData };
            })
            .filter(section => section.data.length > 0);
    }, [searchQuery, allSections]);


    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulating network request
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleAddNew = () => router.push('/forminputlocation');

    const toggleExpand = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(prev => (prev === id ? null : id));
    };

    const handleDelete = (id:string) => {
        Alert.alert(
            "Hapus Lokasi",
            "Yakin ingin menghapus lokasi ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus", style: "destructive",
                    onPress: () => remove(ref(db, `points/${id}`)),
                },
            ]
        );
    };

    const handleEdit = (item: Location) => {
        router.push({
            pathname: "/formeditlocation",
            params: { ...item },
        });
    };

    const handleNavigate = (coordinates: string) => {
        if (!coordinates || !coordinates.includes(',')) {
            Alert.alert("Navigasi Gagal", "Koordinat untuk lokasi ini tidak valid atau tidak tersedia.");
            return;
        }

        const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`;

        if (Platform.OS === 'android') {
            // Use the more specific google.navigation intent for Android
            const androidUrl = `google.navigation:q=${coordinates}`;
            Linking.openURL(androidUrl).catch(() => {
                // Fallback to web if the specific intent fails
                Linking.openURL(googleMapsWebUrl);
            });
        } else { // For iOS and other platforms
            // URL scheme to open Google Maps app on iOS
            const googleMapsAppUrl = `comgooglemaps://?daddr=${coordinates}&directionsmode=driving`;
            
            Linking.canOpenURL(googleMapsAppUrl)
                .then(supported => {
                    if (supported) {
                        // If Google Maps is installed, open it
                        return Linking.openURL(googleMapsAppUrl);
                    } else {
                        // If not, open Google Maps in the browser
                        return Linking.openURL(googleMapsWebUrl);
                    }
                })
                .catch(() => {
                    // On any error, fallback to web
                    Linking.openURL(googleMapsWebUrl);
                });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <LinearGradient
                    colors={['#EBF8FF', '#EDF2F7', '#E2E8F0']}
                    style={StyleSheet.absoluteFill}
                />
                <ActivityIndicator size="large" color="#3182CE" />
                <ThemedText style={{marginTop: 10}}>Memuat Lokasi...</ThemedText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#EBF8FF', '#EDF2F7', '#E2E8F0']}
                style={StyleSheet.absoluteFill}
            />
            <SectionList
                sections={filteredSections}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
                refreshControl={<RefreshControl tintColor="#3182CE" refreshing={refreshing} onRefresh={onRefresh} />}
                renderSectionHeader={({ section: { title } }) => (
                    <ThemedText style={styles.header}>{title}</ThemedText>
                )}
                ListHeaderComponent={
                    <View style={styles.listHeaderContainer}>
                        <View style={styles.searchBar}>
                            <Feather name="search" size={20} color="#A0AEC0" style={{marginLeft: 12}}/>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Cari lokasi, deskripsi, atau kategori..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <LocationCard
                        item={item}
                        isExpanded={expandedId === item.id}
                        onToggle={() => toggleExpand(item.id)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onNavigate={handleNavigate}
                    />
                )}
                ListEmptyComponent={(
                    <View style={styles.center}>
                        <Feather name={searchQuery ? "search" : "map"} size={48} color="#A0AEC0" />
                        <ThemedText style={styles.emptyText}>
                            {searchQuery ? "Tidak Ada Hasil" : "Belum Ada Lokasi"}
                        </ThemedText>
                        <ThemedText style={styles.emptySubText}>
                            {searchQuery 
                               ? `Tidak ada lokasi yang cocok dengan "${searchQuery}"` 
                               : "Tambahkan lokasi baru untuk memulai."
                            }
                        </ThemedText>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.fab} onPress={handleAddNew} activeOpacity={0.8}>
                <LinearGradient
                    colors={['#4299E1', '#3182CE']}
                    style={styles.fabGradient}
                >
                    <FontAwesome name="plus" size={24} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    listContentContainer: {
        paddingHorizontal: 16, 
        paddingTop: 24
    },
    listHeaderContainer: {
        paddingBottom: 24,
        backgroundColor: 'transparent',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        height: 48,
        shadowColor: "#2D3748",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#2D3748',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#4A5568',
    },
    emptySubText: {
        marginTop: 4,
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
        paddingVertical: 12,
        marginBottom: 8,
        // To ensure header background doesn't overlap cards on scroll
        backgroundColor: 'rgba(237, 242, 247, 0.8)', 
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#2D3748",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3182CE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: '#2D3748',
    },
    description: {
        fontSize: 14,
        color: "#718096",
        marginTop: 2,
    },
    expandBox: {
        padding: 16,
        paddingTop: 0,
        gap: 16,
    },
    badge: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(49, 130, 206, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#2C5282",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        color: "#A0AEC0",
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 14,
        color: "#4A5568",
        fontWeight: '500',
        lineHeight: 20, // Improve readability for long text
    },
    actionRow: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-around",
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
        paddingTop: 16,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 4,
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#3182CE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    }
});