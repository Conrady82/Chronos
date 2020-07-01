import React, { useState } from 'react';
const { ipcRenderer } = window.require('electron');

export const DockerContext = React.createContext<any>(null);

const DockerContextProvider: React.FC = ({ children }) => {
  const [dockerData, setDockerData] = useState({});
  console.log('dockerdata------------>', dockerData);
  // interface IContainer {
  //   (containername: string): string;
  //   (containerid: string): string;
  //   (platform: string): string;
  //   (starttime: string): string;
  //   (memoryusage: string): number;
  //   (memorylimit: string): number;
  //   (memorypercent: string): number;
  //   (cpupercent: string): number;
  //   (networkreceived: string): number;
  //   (networksent: string): number;
  //   (processcount: string): number;
  //   (restartcount: string): number;
  // }

  interface IContainer {
    [key: string]: string | number | never;
  }

  // [key: string]: number|string
  // Fetches all data related to a particular app
  const fetchDockerData = (service: string) => {
    ipcRenderer.send('dockerRequest', service);
    ipcRenderer.on('dockerResponse', (event: Electron.Event, data: any) => {
      // Parse result
      const result: IContainer[] = JSON.parse(data);
      console.log('Number of data points (docker):', result.length);
      // Separate data into individual arrays
      const freq: { [key: string]: string[] | number[] | [] | any } = {
        containername: [],
        memoryusage: [],
        memorylimit: [],
        memorypercent: [],
        cpupercent: [],
        networkreceived: [],
        networksent: [],
        processcount: [],
        restartcount: [],
      };

      result.forEach(obj => {
        for (const key in obj) {
          if (!(key in freq)) freq[key] = [];
          freq[key].push(obj[key]);
        }
      });

      // for(let i = 0; i < result.length; i++){
      //   const object = result[i];
      //   const keys = Object.keys(object);
      //   for(let j = 0; j < keys.length; j++){
      //     if(!(keys[j] in freq)) freq[keys[j]] = []
      //     freq[keys[j]].push(object[keys[i]])
      //   }
      // }
      // Update context local state
      setDockerData(freq);
    });
  };
  return (
    <DockerContext.Provider value={{ dockerData, setDockerData, fetchDockerData }}>
      {children}
    </DockerContext.Provider>
  );
};
export default DockerContextProvider;
