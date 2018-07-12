#include <iostream>
#include <cstdio>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <stdlib.h>  
#include <string.h>
using namespace std;

int main(){
	std::ifstream infoFile("System_3(ucdetector)");
    //std::ofstream outFile("final_formatted_codes.txt", std::ofstream::out); //final formatted codes
    
 	
 	std::string infoLine;
	std::string codeLine;
	
	int totalLinesRead = 0;
	
	while(getline(infoFile, infoLine)){
		
		
		std::ostringstream ss2;
     	ss2 << (int)(totalLinesRead/50);
		
		string s = ss2.str();

	
		string fName = "Detected_Clones/Set_";
		fName = fName + s;
		fName = fName + ".clones";
	
		
		std::ofstream outFile( fName.c_str(), std::ofstream::out | std::ofstream::app);
		string buf;
		stringstream ss(infoLine);
		vector<string> tokens;
		while(ss >> buf)tokens.push_back(buf);
		
		//writting clone info at the beginning...
		outFile << "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$" << endl;
		outFile << tokens[1] << endl;
		outFile << tokens[0] << endl;
		outFile << tokens[2] << " "<< tokens[3] << " " << tokens[4] << endl;
		outFile << tokens[5].substr(1, tokens[5].length()-2) << " "<< tokens[6] << " " << tokens[7] << endl;
		outFile << "----------------------------------------" << endl;
		
		
		//raw source code file to take input from
		std::ifstream inFile(tokens[2].c_str());
		
		
		//writting first clone fragment
		int lineCount = 1;
		while(getline(inFile, codeLine)){
			//cout << codeLine;
			if(lineCount >= atoi(tokens[3].c_str() ) && lineCount <= atoi(tokens[4].c_str() ) ){
				outFile << codeLine << endl;
			}
			lineCount++;
		}
		outFile <<endl<< "----------------------------------------" << endl;
		
		//writting second clone fragment
		std::ifstream inFile2(tokens[5].c_str());
		lineCount = 1;
		while(getline(inFile2, codeLine)){
			if(lineCount >= atoi(tokens[6].c_str() ) && lineCount <= atoi(tokens[7].c_str() ) ){
				outFile << codeLine << endl;
			}
			lineCount++;
		}
		outFile <<endl<< "----------------------------------------" << endl;
		
		inFile.close();
		inFile2.close();
	
		outFile.close();
		
		totalLinesRead += 1;
			
	}


	
	
	
	infoFile.close();
	
}
