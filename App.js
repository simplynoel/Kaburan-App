import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, ScrollView } from 'react-native';
//database & authentication
import { database, auth } from './config/firebase';
//calendar
import {Calendar, LocaleConfig} from 'react-native-calendars';
//moment
import moment from 'moment';
//Table
import { FlatList } from 'react-native';
//lottiefiles
import LottieView from "lottie-react-native";
//Fontawesome ICon 
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDashboard, faGear, faPesoSign, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faCalendar, faChartBar, faUserCircle } from '@fortawesome/free-regular-svg-icons';
//Firebase functions
import { collection, getDocs, query, where, addDoc, updateDoc, orderBy, doc } from 'firebase/firestore';
//Picker Dropdown
import Picker from 'react-native-picker-select';

const items = [
  { label: 'Bale', value: 'Bale' },
  { label: 'Utility', value: 'Utility' },
  { label: 'Food', value: 'Food' },
];

//Main Component
export default function App() {

  const [selected, setSelected] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date())
  //firebase data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [navigateTo, setNavigateTo] = useState("Dashboard");
  //calendar
  const [showCalendar, setShowCalendar] = useState(false);
  //is Searching\
  const [searchValue, setSearchValua] = useState("")
  const [searching, setSearching] = useState(false);
  //add row
  const [addRow, showAddRow] = useState(false);
  //save
  const [save, setShowSave] = useState(false);
  //documents
  const [document, setDocument] = useState([]);
  const [expense, setExpense] = useState({
    date: currentDate,
    For:"",
    Amount:"",
    Prices:""
  });

  const [selectedValue, setSelectedValue] = useState('');
  //21-03-2024 WTF did just happen
  const handleValueChange = (value) => {
    setSelectedValue(value);
  };

  useEffect(()=>{
    setLoading(true);
    setTimeout(()=>{
      setLoading(false)
    },1500)
  },[]);
  
  //this sets the date now as the current date on render
  useEffect(()=>{
    setCurrentDate(moment(new Date).format("YYYY-MM-DD"));
  },[]);

  const [tableData, setTableData] = useState([]);

  //ADDING ROW
  const handleAddRow = () => {
    setTableData([...tableData, { name: '', age: '' }]);
  };
  
  const [costs, setCosts] = useState([]);
  const [total, setTotal] = useState();
  const [dates, setDates] = useState({});

  const fetchDates = async () => {
    const dateList = [];
    //fetch dates
    const datesQuery = await getDocs(query(collection(database,"dates")));
    datesQuery.forEach((date)=> {
      dateList.push({id:date.id, selectedDate: date.data().currentDate, selected:true, setDotColor:'red'});
    });

    //format
    const markedDates = {};
    dateList.forEach(event => {
      markedDates[event.selectedDate] = {selected: true, marked: true, selectedColor: 'orange',selectedDotColor: 'orange'};
    });
  
    setDates(markedDates);
    console.log("DatesList " + dates);
  }


  useEffect(()=>{
    fetchDates();
  },[])


  const fetchData = async() => {  
    const data = [];
    const totalAmount = [];
    const querySnapshot = await getDocs(query(collection(database,"costs"),where("dateMade","==",moment(currentDate).format("MMMM DD, YYYY"))))
    querySnapshot.forEach((doc)=> {
      data.push({id:doc.id, type:doc.data().type, dateMade:doc.data().dateMade, cost:doc.data().cost, name:doc.data().name, time:doc.data().time})
      totalAmount.push(Number(doc.data().cost))
    })


    function sortByTime(array) {
      // Check if the input is an array
      if (!Array.isArray(array)) {
        throw new TypeError('Input must be an array');
      }

      // Sort the array using a custom compare function
      return array.sort((a, b) => {
        // Convert time strings to Date objects for comparison
        const timeA = new Date(`1970-01-01T${a.time}`);
        const timeB = new Date(`1970-01-01T${b.time}`);

        // Compare timestamps and return sort order
        return timeA.getTime() - timeB.getTime();
      });
    }
    let time = sortByTime(data)
    const sum = totalAmount.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    setTotal(sum);
    setCosts(time);
  }

  useEffect(()=>{
    fetchData();
    console.log(costs)
  },[currentDate])

  const submitData = async () => {
      if(type!==""&&name!==""&&cost!==""||0){
        await addDoc(collection(database, "costs"),{
          dateMade:moment(currentDate).format("MMMM DD, YYYY"),
          time: moment(new Date()).format("hh:mm a"),
          type: type,
          name: name,
          cost: cost
        })
        await addDoc(collection(database,"dates"),{
          currentDate: moment(currentDate).format("YYYY-MM-DD"),
          selected: true,
          dot: "orange"
        })
        setName("")
        setCost("")
        setType("")
      }else{
        alert("Inputs cannot be empty.")
      }
      fetchDates()
  }

  //searching
  useEffect(()=>{
    console.log(searchValue);
    if(searchValue!==""){
      setSearching(true);
    }
    else{
      setSearching(false);
    }
  },[searchValue])

  const handleChange = (text) => {
    const newText = text.replace(/[^0-9]/g, ''); // Filter non-numeric characters
    setNumber(newText);
  };

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [cost, setCost] = useState(0);

  return (
   <>
     <StatusBar style="auto" />
    <View style={styles.container}>
      {
        loading === true?
        <>
          <View style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}>
            <LottieView
              source={require("../Balitbit-Mining/assets/Animation - 1710728070921.json")}
              style={{width: 500, height: 500}}
              autoPlay
              loop
            />
          </View>
        </>
        :
        <> 
              {
                navigateTo==="Expenses"&&
                <>
                  <View style={{width:'100%',height:'85%',backgroundColor:"white",alignItems:'center',justifyContent:'flex-end',marginTop:'12%'}}>
                    <View style={{width:'100%',height:'10%',backgroundColor:'white',flexDirection:'row',alignItems:'center',justifyContent:'space-around'}}>
                      <View style={{flexDirection:'column'}}>
                        <TouchableOpacity style={{backgroundColor:'rgb(186, 140, 99)',elevation:10,shadowColor:"pink",borderRadius:60,padding:15}} onPress={()=> setShowCalendar(!showCalendar)}>
                          <FontAwesomeIcon size={25} style={{color:'white'}} icon={faCalendar} />
                        </TouchableOpacity>
                      </View>
                      <TextInput placeholder='search expense' onChangeText={(val)=> setSearchValua(val)} style={{width:'70%',borderRadius:30,paddingLeft:15,backgroundColor:'white',padding:5,marginRight:-60,height:45,borderWidth:1}}/>
                      <View style={{backgroundColor:'white',elevation:10,color:'black',shadowColor:"pink",borderRadius:50,padding:8,marginRight:50}}>
                        <FontAwesomeIcon style={{color:'black',}} size={25} icon={faSearch} />
                      </View>
                    </View>
                    <Text style={{marginTop:14,fontSize:17,lineHeight:20}}>{moment(currentDate).format("MMMM DD, YYYY | dddd")}</Text> 
                    <ScrollView style={{width:'100%',height:'60%',alignSelf:'center'}}>
                      {
                        searching === true&&
                        <View style={{width:'90%',height:'60%',backgroundColor:'#f5d3a6ss',alignSelf:'center',elevation:20,shadowColor:'black',marginTop:'7%',alignItems:'center',justifyContent:'center'}}>
                          <Text style={{fontSize:14,color:'navy'}}>no data found</Text>
                        </View>
                      }
                      {
                      costs.map((data)=>(
                       data===null?
                        <View style={{width:'90%',height:40,borderWidth:1,marginLeft:"10%",flexDirection:'row',alignItems:'center',justifyContent:'space-evenly',marginTop:12,backgroundColor:'beige',elevation:10,shadowColor:'greenyellow'}} key={data.id}>
                          <Text>No Data</Text>
                        </View>
                      :
                        <TouchableOpacity>
                          <View style={{width:'90%',height:40,borderWidth:1,alignSelf:'center',flexDirection:'row',alignItems:'center',justifyContent:'space-evenly',marginTop:12,backgroundColor:'#3E4137',elevation:10,shadowColor:'grey'}} key={data.id}>
                            <Text  style={{color:'white'}}>{data.type}</Text>
                            <Text  style={{color:'white'}}>{data.name}</Text>
                            <Text  style={{color:'white'}}>₱ {data.cost}</Text>
                          </View>
                        </TouchableOpacity>
                      ))
                     }
                    </ScrollView>
                    {
                        showCalendar===true&&
                        <View style={{width:'90%',height:400,backgroundColor:'white',elevation:15,shadowColor:'black',position:'relative',alignSelf:'center'}}>
                          <Calendar
                            // Customize the appearance of the calendar
                            style={{
                              height: '47%', 
                              width:'auto',
                            }}
                            // Specify the current date
                            //current={moment(new Date()).format("YYYY-MM-DD")}
                            // Callback that gets called when the user selects a day
          
                            onDayPress={day => {
                              console.log(moment(day).subtract(1,"month").format("MMMM DD, YYYY DDDD"));
                              setCurrentDate(moment(day).subtract(1,"month"))
                              setShowCalendar(false)
                            }}
                             Mark specific dates as marked
                            markedDates={dates}
                          />
                        </View>
                      }
                    <View style={{width:'90%',height:'5%',borderWidth:1,flexDirection:'row',alignItems:'center',justifyContent:'space-evenly',marginTop:12,backgroundColor:'lightgrey',elevation:10,shadowColor:'grey'}} key={data.id}>
                      <Text></Text>
                      <Text style={{marginLeft:60}}>TOTAL AMOUNT:<Text style={{fontWeight:400,fontSize:20}}> ₱ {total}</Text></Text>
                    </View>
                    <View style={{width:'100%',height:'15%',flexDirection:'column',alignItems:'center',justifyContent:'space-evenly'}}>
                      <View style={{width:'90%',height:50,flexDirection:'row',alignItems:'center',justifyContent:'space-evenly',borderWidth:1 ,backgroundColor: '#393741'}}>
                        <View style={{width:'30%',height:'80%',flexDirection:'row',borderBottomWidth:1,borderColor:'white'}}>
                          <TextInput style={{color:'white'}} value={type} onChangeText={(type)=> setType(type)} placeholder='Enter Type' placeholderTextColor={"white"} maxLength={15} />
                        </View>
                        <View style={{width:'30%',height:'80%',flexDirection:'row',borderBottomWidth:1,borderColor:'white'}}>
                          <TextInput style={{color:'white'}} value={name} onChangeText={(name)=> setName(name)} placeholder='Enter Name'  placeholderTextColor={"white"} maxLength={15}/>
                        </View>
                        <View style={{width:'30%',height:'80%',flexDirection:'row',borderBottomWidth:1,borderColor:'white'}}>
                          <TextInput style={{color:'white'}} value={cost} onChangeText={(cost)=> setCost(cost)} placeholder='Enter Cost'  placeholderTextColor={"white"} maxLength={6} keyboardType='numeric'/>
                        </View>
                      </View>
                      <TouchableOpacity onPress={()=> [submitData(),fetchData()]} style={{width:120,height:35,borderRadius:5,backgroundColor:'#00A68D',alignItems:'center',justifyContent:'center'}}>
                          <Text  style={{color:'white'}}>Add </Text>
                      </TouchableOpacity> 
                    </View>

                  </View>
                </>
              }
                        {
            navigateTo==="Dashboard"&&
            <View style={{width:'100%',height:'85%',marginTop:'12%'}}>

            </View>
          }
                    {
            navigateTo==="Profiles"&&
            <View style={{width:'100%',height:'85%',marginTop:'12%'}}>

            </View>
          }
                    <View style={{width:'96%',height:'7%',backgroundColor:'white',flexDirection:'row',alignItems:'center',justifyContent:'space-around',elevation:15,shadowColor:'navy',borderRadius:20}}>
                      <TouchableOpacity onPress={()=> setNavigateTo("Dashboard")} style={{width:'30%',height:'50%',flexDirection:'column',alignItems:'center',justifyContent:'space-evenly',}}>
                        <FontAwesomeIcon icon={faChartBar} color={navigateTo==="Dashboard"?"brown":"black"} size={24}/>
                        <Text style={{color:navigateTo==="Dashboard"?"brown":"black"}}>Dashboard</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=> setNavigateTo("Expenses")} style={{width:'30%',height:'50%',flexDirection:'column',alignItems:'center',justifyContent:'space-evenly',}}>
                        <FontAwesomeIcon icon={faPesoSign} color={navigateTo==="Expenses"?"brown":"black"} size={24}/>
                        <Text style={{color:navigateTo==="Expenses"?"brown":"black"}}>Add Expenses</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=> setNavigateTo("Profiles")} style={{width:'30%',height:'50%',flexDirection:'column',alignItems:'center',justifyContent:'space-evenly',}}>
                        <FontAwesomeIcon icon={faUserCircle} color={navigateTo==="Profiles"?"brown":"black"} size={24}/>
                        <Text  style={{color:navigateTo==="Profiles"?"brown":"black"}}>Players</Text>
                      </TouchableOpacity>
                    </View>
            </>
      }
    </View>
   </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    color:'black',
    width:'100%',
    height:'100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow:'hidden'
  },
});
