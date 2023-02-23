/* eslint-disable no-bitwise */
import React, { useEffect, useState, useContext } from 'react';
import { ApplicationContext } from '../context/ApplicationContext';
import { DashboardContext } from '../context/DashboardContext';
import { Typography } from '@material-ui/core';
import { AwsContext } from '../context/AwsContext';

import '../stylesheets/AWSGraphsContainer.scss';
import AwsChart from '../charts/AwsChart';
import ClusterTable from '../components/ClusterTable';

const AwsGraphsContainer: React.FC = React.memo(props => {
  const { awsData, setAwsData, awsAppInfo, fetchAwsData, fetchAwsEcsData, fetchAwsAppInfo } = useContext(AwsContext);
  const { app, appIndex, intervalID, setIntervalID } = useContext(ApplicationContext);
  const { user } = useContext(DashboardContext);
  // const [intervalID, setintervalID] = useState<NodeJS.Timeout | null>(null);
  const [awsLive, setAwsLive] = useState<boolean>(false);
  const { typeOfService, region } = awsAppInfo;

  useEffect(() => {
    if (awsLive) {
      console.log('we are live! fetching data every 10 seconds...');

      setIntervalID(
        setInterval(() => {
          console.log('intervalId after click live', intervalID);
          fetchAwsData(user, appIndex);
          fetchAwsAppInfo(user, appIndex);
          fetchAwsEcsData(user, appIndex);
        }, 2000)
      )
    } else {
      console.log('not fetching data')
      if(intervalID) clearInterval(intervalID);
      fetchAwsData(user, appIndex);
      fetchAwsAppInfo(user, appIndex);
      fetchAwsEcsData(user, appIndex);
    }
  }, [awsLive]);

  useEffect(() => {
    return () => {
      console.log('unmounting, shut down fetch process');

      if(intervalID) clearInterval(intervalID);
      setAwsData({ CPUUtilization: [], NetworkIn: [], NetworkOut: [], DiskReadBytes: [] })
    }
  }, [])
  
  const stringToColor = (string: string, recurses = 0) => {
    if (recurses > 20) return string;
    function hashString(str: string) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let colour = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += `00${value.toString(16)}`.substring(-2);
      }

      console.log(colour);
      return colour;
    }
  };

  // const awsGraphArray = Object.keys(awsData)?.map(metric => {

  // })

  return (
    <div className="AWS-container">
      <div className="AWSheader">
        <Typography variant="h3">{app}</Typography>
        <p>Metrics for AWS Service</p>
        <button onClick={() => setAwsLive(!awsLive)}>
          {awsLive ? (
            <div>
              <span id="live">Live</span>
            </div>
          ) : (
            <div id="gatherLiveData">Gather Live Data</div>
          )}
        </button>
      </div>
      <div className="cluster-table">
        {awsAppInfo.typeOfService === 'AWS/ECS' && (
          <ClusterTable typeOfService={typeOfService} region={region} />
        )}
      </div>
      <div className="charts">
        <AwsChart 
          className='chart'
          // key={`Chart${counter}`}
          renderService="CPU Utilization"
          metric="Percent"
          timeList={awsData.CPUUtilization?.map(el => el.time)}
          valueList={awsData.CPUUtilization?.map(el => el.value)}
          // sizing={props.sizing}
          colourGenerator={stringToColor}
        />
        <AwsChart 
          className='chart'
          // key={`Chart${counter}`}
          renderService="Network In"
          metric="Percent"
          timeList={awsData.NetworkIn?.map(el => el.time)}
          valueList={awsData.NetworkIn?.map(el => el.value)}
          // sizing={props.sizing}
          colourGenerator={stringToColor}
        />
        <AwsChart 
          className='chart'
          // key={`Chart${counter}`}
          renderService="Network Out"
          metric="Percent"
          timeList={awsData.NetworkOut?.map(el => el.time)}
          valueList={awsData.NetworkOut?.map(el => el.value)}
          // sizing={props.sizing}
          colourGenerator={stringToColor}
        />
        <AwsChart 
          className='chart'
          // key={`Chart${counter}`}
          renderService="DiskReadBytes"
          metric="Percent"
          timeList={awsData.DiskReadBytes?.map(el => el.time)}
          valueList={awsData.DiskReadBytes?.map(el => el.value)}
          // sizing={props.sizing}
          colourGenerator={stringToColor}
        />
      </div>
    </div>
  );
  // }
});

export default AwsGraphsContainer;
