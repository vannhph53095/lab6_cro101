import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator,Button ,TouchableOpacity,Modal,TextInput,Alert} from "react-native";
import {api} from '../../api';

export default function App() {


  type users = {
    id: number;
    avatar: string;
    name: string;
    dob: string;
  }

  const [data, setData] = useState<users[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedusers, setSelectedusers] = useState<users | null>(null);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newAvatar, setNewAvatar] = useState("");

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [usersToDelete, setusersToDelete] = useState<users | null>(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newusersName, setNewusersName] = useState("");
  const [newusersDate, setNewusersDate] = useState("");
  const [newusersAvatar, setNewusersAvatar] = useState("");

  const [modalDetailVisible, setModalDetailVisible] = useState(false);


  useEffect(() => {
    api.get('/users')
      .then((response) => {
        setData(response); 
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);


  const openModalDetail = (users: users) => {
    setSelectedusers(users);
    setModalDetailVisible(true);
  }
  

  const openEditModal = (users: users) => {
    setSelectedusers(users);
    setNewName(users.name);
    setNewDate(users.dob);
    setNewAvatar(users.avatar);
    setModalVisible(true);
  };

  const openDeleteModal = (users: users) => {
    setusersToDelete(users);
    setDeleteModalVisible(true);
  };

  const handleSave = () => {
    if (selectedusers) {
      if (!newName || !newDate || !newAvatar) {
        Alert.alert("Please fill all fields");
        return;
      }
      const updatedusers = { 
        ...selectedusers, 
        name: newName, 
        dob: newDate, 
        avatar: newAvatar 
      };
  
      api.put(`/users/${selectedusers.id}`, updatedusers)
        .then(() => {
          const updatedData = data.map(item =>
            item.id === selectedusers.id ? updatedusers : item
          );
          setData(updatedData);
          setModalVisible(false);
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
      
    }
  };

  const handleDelete = () => {
    if (usersToDelete) {
      api.delete(`/users/${usersToDelete.id}`)
        .then(() => {
          setData(data.filter(item => item.id !== usersToDelete.id));
          setDeleteModalVisible(false);
        })
        .catch((error) => {
          console.error("Error deleting data:", error);
        });
    }
  };

  const handleAddusers = () => {
    const newusers: users = {
      id: data.length + 1,
      name: newusersName,
      dob: newusersDate,
      avatar: newusersAvatar,
    };

    if(!newusersName || !newusersDate || !newusersAvatar){
      Alert.alert("Please fill all fields");
      return;
    }

    api.post('/users', newusers)
      .then((response) => {
        setData([...data, response]); 
        setAddModalVisible(false);
        setNewusersName("");
        setNewusersDate("");
        setNewusersAvatar("");
      })
      .catch((error) => {
        console.error("Error adding data:", error);
      });
  };
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openModalDetail(item)}>
              <Image source={{ uri: item.avatar }} style={styles.image} />
              <View style={{flexDirection: "column", width: 200}}>
                <Text style={styles.text}>ID: {item.id}</Text>
                <Text style={styles.text}>Name: {item.name}</Text>
                <Text style={styles.text}>Date: {item.dob}</Text>
              </View>
              <View style={{flexDirection: 'column',padding: 10}}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => openEditModal(item)}>
                <Text style={styles.buttonText}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDelete} onPress={() => openDeleteModal(item)}>
                <Text style={styles.buttonText}>Xoá</Text>
              </TouchableOpacity>
              </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalDetailVisible} transparent={true} animationType="slide">
        <View style={styles.detailContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thông tin chi tiết</Text>
            <Text style={styles.detailText}>ID: {selectedusers?.id}</Text>
            <Text style={styles.detailText}>Name: {selectedusers?.name}</Text>
            <Text style={styles.detailText}>Date: {selectedusers?.dob}</Text>
            <Image source={{ uri: selectedusers?.avatar }} style={styles.detailImage} />
            <TouchableOpacity style={styles.detailButton} onPress={() => setModalDetailVisible(false)}>
              <Text style={styles.detailButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

        {/* Update */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
            <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Nhập tên mới" />
            <TextInput style={styles.input} value={newDate} onChangeText={setNewDate} placeholder="Nhập ngày mới" />
            <TextInput style={styles.input} value={newAvatar} onChangeText={setNewAvatar} placeholder="Nhập link ảnh mới" />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete */}
      <Modal visible={deleteModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận xoá</Text>
            <Text>Bạn có chắc chắn muốn xoá {usersToDelete?.name} không?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btnDelete,{backgroundColor:'#007bff',width: 60}]} onPress={handleDelete}>
                <Text style={styles.buttonText}>Xoá</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnCancel,{width: 60}]} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add */}
      <Modal visible={addModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm động vật</Text>
            <TextInput style={styles.input} value={newusersName} onChangeText={setNewusersName} placeholder="Nhập tên" />
            <TextInput style={styles.input} value={newusersDate} onChangeText={setNewusersDate} placeholder="Nhập ngày" />
            <TextInput style={styles.input} value={newusersAvatar} onChangeText={setNewusersAvatar} placeholder="Nhập link ảnh" />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.btnAdd} onPress={handleAddusers}>
                <Text style={styles.buttonText}>Thêm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    marginVertical: 5, 
    borderRadius: 8,
    padding: 5, 
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: "row", 
    justifyContent: "space-between"
  },
  image: {
    width: 80, 
    height: 80,
    borderRadius: 8,
  },
  text: {
    marginLeft: 10,
    fontSize: 18, 
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnEdit: { 
    width: 50,
    backgroundColor: '#007bff', 
    padding: 8, 
    borderRadius: 5, 
    marginRight: 5 ,
    alignItems: "center",
  },
  btnDelete: { 
    width: 50,
    backgroundColor: '#dc3545', 
    padding: 8, 
    borderRadius: 5 ,
    marginTop: 5,
    alignItems: "center"
  }, 
  buttonText: { 
    color: '#fff' 
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 5,
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },

  btnSave: {
    width: 50,
    backgroundColor: '#28a745', 
    padding: 8, 
    borderRadius: 5 ,
    marginTop: 5,
    alignItems: "center",
    marginLeft: 10,
  },
  btnCancel: {
    width: 50,
    backgroundColor: '#dc3545', 
    padding: 8, 
    borderRadius: 5 ,
    marginTop: 5,
    alignItems: "center",
    marginLeft: 10,
  },
  btnAdd : {
    width: 60,
    backgroundColor: '#28a745',
    padding: 8, 
    borderRadius: 5 ,
    marginTop: 5,
    alignItems: "center",
    marginLeft: 10,
  },
  detailContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  detailImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  detailText: {
    fontSize: 18,
    marginBottom: 5,
  },
  detailButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    width: 70,
    alignItems: "center",
    marginVertical: 5,
  },
  detailButtonText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginVertical: 5,
  },

});
