import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import AppHeader from '../components/AppHeader'

export default class ItemRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      itemName:"",
      reasonToRequest:"",
      requestId:'',
      requestedItemName:'',
      itemStatus:'',
      IsItemRequestActive:'',
      docId:'',
      userDocId:''
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }

  getItemRequest = () => {
    var itemRequest = db.collection('requested_books').where('user_id','==',this.state.userId).get().then((snapshot)=>{
      snapshot.forEach((doc)=>{
        if(doc.data().item_status!== "recieved")
        {
          this.setState({
            requestId:doc.data().request_id,
            requestedItemName:doc.data().book_name,
            itemStatus:doc.data().book_status,
            docId:doc.id
          })
        }
      })
    })
  }



  addRequest =(itemName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    db.collection('requested_items').add({
        "user_id": userId,
        "item_name":itemName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
        "item_status":"requested",
        "date":firebase.firestore.FieldValue.serverTimestamp()
    })
    this.getItemRequest();
    db.collection('users').where("email_id","==",userId).get().then()
    .then((snapshot)=>{
     snapshot.forEach((doc)=>{
       db.collection("users").doc(doc.id).update({
         IsItemRequestActive:true
       })
     })
    })
    this.setState({
        itemName :'',
        reasonToRequest : ''
    })

    return Alert.alert("item Requested Successfully")
  }

  getIsItemRequestActive = () => {
    db.collection('users').where('email_id','==',this.state.userId).onSnapshot(querySnapshot => {
      querySnapshot.forEach(doc => {
        this.setState({
          IsItemRequestActive:doc.data().IsItemRequestActive,
          userDocId:doc.id
        })
      })
    })
  }

  sendNotifications = () => {
     db.collection('users').where("email_id","==",this.state.userId).get().then((snapshot)=>{
       snapshot.forEach((doc)=>{
         var name = doc.data().first_name;
         var lastName = doc.data().last_name;
         db.collection('all_notification').where('request_id',"==",this.state.requestId).get().then((snapshot)=>{
           snapshot.forEach((doc)=>{
             var donorId = doc.data().donor_id;
             var itemname = doc.data().item_name;
             db.collection('all_notification').add({
               "targeted_user_id":donorId,
               "message":name + " " + lastName + " recieved the item " + itemName,
               "notification_status":"unread",
               "item_name":itemname
             })
           })
         })
       })
     })
  }

  updateItemRequestStatus = () => {
    db.collection("requested_item").doc(this.state.docId).update({
      "item_status":"recieved",
      
    })
    db.collection("users").where("email_id","==",this.state.userId).get().then((snapshot)=>{
      snapshot.forEach((doc)=>{
        db.collection("users").doc(doc.id).update({
          "IsItemRequestActive":false
        })
      })
    })
  }

  recievedItems = (itemName) => 
  {
    var userId = this.state.userId;
    var requestId = this.state.requestId;

    db.collection('recieved_item').add({
      "user_id":userId,
      "item_name":itemName,
      "request_id":requestId,
      "itemStatus":"recieved"
    })
  }

  componentDidMount(){
    this.getItemRequest();
    this.getIsItemRequestActive();
  }


  render(){
    if(this.state.IsItemRequestActive === true)
    {
      return(
         <View style = {{flex:1,justifyContent:'center'}}>
            <View style = {{borderColor:'orange',borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                <Text>Item Name</Text>
                <Text>{this.state.requestedItemName}</Text>
            </View>
            <View style = {{borderColor:'orange',borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                <Text>Item Status</Text>
                <Text>{this.state.itemStatus}</Text>
            </View>
            <TouchableOpacity
             style = {{borderWidth:1,borderColor:'orange',backgroundColor:'orange',width:300,alignSelf:'center',alignItems:'center',height:30,marginTop:30}}
             onPress = {() => {
               this.sendNotifications();
               this.updateItemRequestStatus();
               this.recievedItems(this.state.requestedItemName);
               
             }}
            >
              <Text>I recieved the item</Text>
            </TouchableOpacity>
         </View>
      )
    } 
    else
    {

    

    return(
        <View style={{flex:1}}>
          <AppHeader title="Request Items" navigation ={this.props.navigation}/>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter item name"}
                onChangeText={(text)=>{
                    this.setState({
                        itemName:text
                    })
                }}
                value={this.state.itemName}
              />
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the item"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.itemName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    )
  }
}
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)
