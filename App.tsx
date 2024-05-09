import React, { PureComponent } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SpellItem = ({ spell, isFavorite, toggleFavorite, onPress }) => (
  <TouchableOpacity onPress={() => onPress(spell)}>
    <View style={styles.spellContainer}>
      <Text style={styles.spellName}>{spell.name}</Text>
      <Text style={styles.spellDesc}>{spell.desc}</Text>
      <TouchableOpacity onPress={() => toggleFavorite(spell)} style={styles.favoriteButton}>
        <Text style={styles.favoriteText}>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const SpellDetailsModal = ({ spell, visible, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {spell && (
          <>
            <Text style={styles.modalTitle}>{spell.name}</Text>
            <Text style={styles.modalDesc}>{spell.desc}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  </Modal>
);

class SpellListScreen extends PureComponent {
  state = {
    spells: [],
    favorites: [],
    selectedSpell: null,
    isModalVisible: false,
  };

  componentDidMount() {
    this.fetchSpellData();
    this.loadFavorites();
  }

  fetchSpellData = async () => {
    try {
      const response = await fetch('https://www.dnd5eapi.co/api/spells');
      const data = await response.json();
      this.setState({ spells: data.results });
    } catch (error) {
      console.error('Error fetching spell data:', error);
    }
  };

  loadFavorites = async () => {
    try {
      const jsonFavorites = await AsyncStorage.getItem('favorites');
      if (jsonFavorites !== null) {
        this.setState({ favorites: JSON.parse(jsonFavorites) });
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  saveFavorites = async (favorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  addToFavorites = (spell) => {
    const { favorites } = this.state;
    const updatedFavorites = [...favorites, spell];
    this.setState({ favorites: updatedFavorites });
    this.saveFavorites(updatedFavorites);
  };

  removeFromFavorites = (spell) => {
    const { favorites } = this.state;
    const updatedFavorites = favorites.filter((item) => item.index !== spell.index);
    this.setState({ favorites: updatedFavorites });
    this.saveFavorites(updatedFavorites);
  };

  isFavorite = (spell) => {
    const { favorites } = this.state;
    return favorites.some((item) => item.index === spell.index);
  };

  toggleFavorite = (spell) => {
    if (this.isFavorite(spell)) {
      this.removeFromFavorites(spell);
    } else {
      this.addToFavorites(spell);
    }
  };

  openSpellDetails = (spell) => {
    this.setState({ selectedSpell: spell, isModalVisible: true });
  };

  closeSpellDetails = () => {
    this.setState({ isModalVisible: false });
  };

  renderItem = ({ item }) => (
    <SpellItem
      spell={item}
      isFavorite={this.isFavorite(item)}
      toggleFavorite={this.toggleFavorite}
      onPress={this.openSpellDetails}
    />
  );

  render() {
    const { spells, isModalVisible, selectedSpell } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>D&D Spells</Text>
        <FlatList
          data={spells}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.index}
          contentContainerStyle={styles.listContainer}
        />
        <SpellDetailsModal
          spell={selectedSpell}
          visible={isModalVisible}
          onClose={this.closeSpellDetails}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  spellContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  spellName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  spellDesc: {
    fontSize: 16,
    marginBottom: 10,
  },
  favoriteButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  favoriteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SpellListScreen;
