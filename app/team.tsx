import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import Colors from '@/constants/Colors';
import BackButton from '@/components/BackButton';

// Batch card colour hierarchy
const HIERARCHY_COLORS = [
  Colors.tint, // 1st card (2nd years)
  Colors.green, // 2nd card (3rd years)
  Colors.blue, // 3rd card (4th years)
  Colors.yellow, // 4th card (5th years / most recent alums)
];

// Batch data dictionary
// When 2026 batch enters 2nd year,  add { year: '2026', members: [...] } to the very top
const TEAM_DATA = [
  /*
  {
    year: '2025',
    members: [
      'Ameya Agarwal', 'Dev Kumar', 'Dhairya Sharma', 'Jagannath Pisharody', 'Khushi Mehta', 'Mitali Kabra', 'Parth Ashwylawan', 'Prabhav Purandare', 'Pratyush Kathuria', 'Pulak Bagaria', 'Shreyas Krishnan', 'Spandan Kulkarni', 'Suhrit Rao', 'Vihaan Goenka'
    ]
  },
  {
    year: '2024',
    members: [
      'Abhirup Tapadar', 'Aditi Baral (AEP Editor)', 'Aditya (Chief Designer)', 'Anika Tyagi', 'Darsh Patel (Chief Designer)', 'Harivansh Mehta', 'Jayant Gupta', 'Latika Anand', 'Parasmay Acharya (BEP Editor)', 'Raafey Aziz', 'Saumya Goyal (BEP Editor)', 'Shireen Kar (TFP Editor)', 'Soham Saxena', 'Tanmay Arora', 'Tanvi Gangakhedkar (CF Editor)'
    ]
  },
  {
    year: '2023',
    members: [
      'Aditya Gawade (AEP Editor)', 'Chandrasnata Mohanty', 'Ishita Sethi (BEP Editor)', 'Kalyani Naik (CF Editor)', 'Kedar Athrey (Chief Designer)', 'Keerthi Saripella (OEP Editor)', 'Kuhoo Sathe', 'Kunal Verma', 'Laavanya Datta', 'Laxman Patel', 'Moshajjar Hussain', 'Shreya Karnwal (TFP Editor)', 'Vamsi Addepalli'
    ]
  },
  {
    year: '2022',
    members: [
      'Adhvaith KS', 'Aniruddha Deshpande (Chief Designer)', 'Anshuman X', 'Esha Jain (BEP Editor)', 'Garvit X', 'Harsh Panwar (OEP Editor)', 'Ishaan X', 'Nishit X', 'Shivansh Dwivedi (TFP Editor)', 'Shreyas Mishra', 'Siddharth Garg (CF Editor)', 'Stuti Sinha (AEP Editor)', 'Tarun S', 'Vivegan S'
    ]
  },
  */
 {
    year: '2025',
    members: [
      'Ameya A', 'Dev K', 'Dhairya S', 'Jagannath P', 'Khushi M', 'Mitali K', 'Parth A', 'Prabhav P', 'Pratyush K', 'Pulak B', 'Shreyas K', 'Spandan K', 'Suhrit R', 'Vihaan G'
    ]
  },
  {
    year: '2024',
    members: [
      'Abhirup T', 'Aditi B (AEP Editor)', 'Aditya (Chief Designer)', 'Anika T', 'Darsh P (Chief Designer)', 'Harivansh M', 'Jayant G', 'Latika A', 'Parasmay A (BEP Editor)', 'Raafey A', 'Saumya G (OEP Editor)', 'Shireen K (TFP Editor)', 'Soham S', 'Tanmay A', 'Tanvi G (CF Editor)'
    ]
  },
  {
    year: '2023',
    members: [
      'Aditya G (AEP Editor)', 'Chandrasnata M', 'Ishita S (BEP Editor)', 'Kalyani N (CF Editor)', 'Kedar A (Chief Designer)', 'Keerthi S (OEP Editor)', 'Kuhoo S', 'Kunal V', 'Laavanya D', 'Laxman P', 'Moshajjar H', 'Shreya K (TFP Editor)', 'Vamsi A'
    ]
  },
  {
    year: '2022',
    members: [
      'Adhvaith KS', 'Aniruddha D (Chief Designer)', 'Anshuman X', 'Esha J (BEP Editor)', 'Garvit X', 'Harsh P (OEP Editor)', 'Ishaan X', 'Nishit X', 'Shivansh D (TFP Editor)', 'Shreyas M', 'Siddharth G (CF Editor)', 'Stuti S (AEP Editor)', 'Tarun S', 'Vivegan S'
    ]
  },
  {
    year: '2021',
    members: [
      'Aditi C', 'Aditi M', 'Aditya (AEP Editor)', 'Akshatha (OEP Editor)', 'Anantshree', 'Gowrav', 'Harshita (BEP Editor)', 'Iyer (TFP Editor)', 'Kavya', 'Krishnam', 'Navin', 'Samarth', 'Sury (Chief Designer)', 'Vidit', 'Yash'
    ]
  },
  {
    year: '2020',
    members: [
      'Aarjav (BEP Editor)', 'Adaa (OEP Editor)', 'Anurag', 'Anushka (TFP Editor)', 'Avi', 'Keshav', 'Mizaan', 'Nandinee', 'Riya (AEP Editor)', 'Sahaj (Media Head)', 'Shaz (CF Editor)', 'Zehaan'
    ]
  },
  {
    year: '2019',
    members: [
      'Abhigya', 'Advait', 'Ani', 'Anuneet', 'Ashutosh (Chief Designer)', 'Ayushmaan (Fest Press Editor)', 'Dash', 'Digvijay', 'Kumaraditya (Media Head)', 'Parimi (TFP Editor)', 'Saksham', 'Siddharth', 'Tejas (AEP Editor)', 'Ved'
    ]
  },
  {
    year: '2018',
    members: [
      'Adit', 'Chiraag (AEP Editor)', 'Effy', 'Gandhar (BEP Editor)', 'George', 'Hamza (Chief Designer)', 'Pranav', 'Sabhya (OEP Editor)', 'Sarthak', 'Shreyasi (TFP Editor)', 'Utkarsh (CF Editor)'
    ]
  },
  {
    year: '2017',
    members: [
      'Abhinav (TFP Editor)', 'Anirudh (OEP Editor)', 'Archith', 'Aswathy', 'Debarpan (Chief Designer)', 'Jai (BEP Editor)', 'Jayanth', 'Roshan', 'Saksham (CF Editor)', 'Vasudevan (AEP Editor)', 'Vinay', 'Yashaswi'
    ]
  },
  {
    year: '2016',
    members: [
      'Anuvind', 'Ardra', 'Aswin (BEP Editor)', 'Divya (AEP Editor)', 'Mamallan (Chief Designer)', 'Mustansir (TFP Editor)', 'Naveen (CF Editor)', 'Swarup', 'Vidhi (OEP Editor)'
    ]
  },
  {
    year: '2015',
    members: [
      'Anurup (BEP Editor)', 'Deepak', 'Devanshu', 'Gokul', 'Nabeel (CF Editor)', 'Samksha (AEP Editor)', 'Sneha (OEP Editor)', 'Vaswani', 'Vighnesh (TFP Editor)', 'Vivek'
    ]
  },
  {
    year: '2014',
    members: [
      'Gautam (AEP Editor)', 'Karan (CF Editor)', 'Lalit (TFP Editor)', 'Niharika (OEP Editor)', 'Pranav (BEP Editor)', 'Pranjali', 'Prayaag', 'Rishabh', 'Saylee (OEP Editor)', 'Shreya', 'Sibesh', 'Tushar'
    ]
  },
  {
    year: '2013',
    members: [
      'Akhilesh', 'Anirudh', 'Danish (CF Editor)', 'Deeksha', 'Devina (OEP Editor)', 'Gayatri (AEP Editor)', 'Lasya', 'Manesh', 'Sanket (TFP Editor)', 'Shubham', 'Vishal (BEP Editor)', 'Yimkum'
    ]
  },
  {
    year: '2012',
    members: [
      'Ananth', 'Anish (AEP Editor)', 'Archit', 'Madhusudan', 'Pratik', 'Rahul (BEP Editor)', 'Rusheen (OEP Editor)', 'Soumya (CF Editor)', 'Srishti', 'Tanay', 'Tanmayee', 'Vijay (TFP Editor)'
    ]
  },
  {
    year: '2011',
    members: [
      'Ajay', 'Debolina', 'Kruti', 'Neel', 'Nithya', 'Prateek', 'Ramya', 'Ritvik', 'Rohan', 'Sahil D', 'Sahil K', 'Shalaka', 'Shashank', 'Shruti', 'Steffie', 'Viraj'
    ]
  },
  {
    year: '2010',
    members: [
      'IG', 'Angad', 'Manickam', 'Mohit', 'Pranita', 'Spriha', 'Siddhant', 'Tanya', 'Vishala', 'Shuja'
    ]
  },
  {
    year: '2009',
    members: [
      'Adwait', 'Asmita', 'Deepa', 'Dipto', 'Iyer', 'Kanishk', 'Parikshit', 'Reetika', 'Reuben', 'Rishi', 'Satyaam', 'Shruti', 'Shreyas', 'Soumyadipto', 'Sriram', 'Subhayan', 'Viswadeep'
    ]
  },
  {
    year: '2008',
    members: [
      'Ankita', 'Arnab (TFP Editor)', 'Arushi', 'Ayushi', 'Deepika', 'Eshaan', 'Gautam', 'Ipshita', 'Neeharika', 'Rohit', 'Utsab', 'Vishal'
    ]
  },
  {
    year: '2007',
    members: [
      'Rajat', 'Abhishek', 'Hema', 'Neeti', 'Rajarshi', 'Sarthak', 'Sonal', 'Soumya', 'Udit'
    ]
  },
];

export default function TeamScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Helper function to map names, add interpuncts, and auto-bold 3rd year PORs parentheses
  const renderFormattedNames = (members: string[], batchIndex: number) => {
    return members.map((member, index) => {
      const isLastItem = index === members.length - 1;
      const separator = isLastItem ? '' : '  ·  ';

      // If member has a POR role in parentheses
      if (member.includes('(') && member.includes(')')) {
        const [name, rolePart] = member.split('(');
        const role = rolePart.replace(')', '');
        
        // Check if belongs to 2nd card batch
        const isCoreBatch = batchIndex === 1;

        return (
          <Text key={index} style={styles.nameText}>
            {name}(<Text style={isCoreBatch ? styles.boldRole : {}}>{role}</Text>){separator}
          </Text>
        );
      }

      // Standard render for normal names
      return (
        <Text key={index} style={styles.nameText}>
          {member}{separator}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <Stack.Screen options={{ headerShown: false }} />
      
      <BackButton onPress={() => router.back()} color={Colors.grey}/>
      
      {/* EPC logo header */}
      <View style={styles.logoHeaderContainer}>
        <Image 
          source={require('@/assets/images/EPCLogo.jpg')} 
          style={styles.logo} 
          contentFit="contain"
        />
      </View>

      {/* Batch cards list */}
      <ScrollView 
        showsVerticalScrollIndicator={true} 
        contentContainerStyle={styles.scrollContent}
      >
        {TEAM_DATA.map((batch, index) => {
          
          // Get batch card colour from the array. If index 4 or higher (5th card onwards), fall back to light grey
          const cardColor = HIERARCHY_COLORS[index] || Colors.lightGrey;

          return (
            <View 
              key={batch.year} 
              style={[styles.cardContainer, { backgroundColor: cardColor }]}
            >
              {/* Year */}
              <View style={styles.cardHeader}>
                <Text style={styles.yearText}>{batch.year}</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Names */}
              <View style={styles.cardBody}>
                <Text style={styles.namesBlock}>
                  {/* 2. Pass the 'index' to the function right here! */}
                  {renderFormattedNames(batch.members, index)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  logoHeaderContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  logo: {
    width: 180,
    height: 180,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60, // Room to scroll past the bottom card
    gap: 12, // Card spacing
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  yearText: {
    fontSize: 23,
    fontFamily: 'Lora',
    color: Colors.text,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.background,
  },
  cardBody: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  namesBlock: {
    lineHeight: 24, // Vertical spacing between lines of names
  },
  nameText: {
    fontSize: 15,
    fontFamily: 'Lato',
    color: Colors.text, 
  },
  boldRole: {
    fontFamily: 'LatoSemibold', // Auto-applied to 3rd year POR roles
    color: Colors.text,
  },
});