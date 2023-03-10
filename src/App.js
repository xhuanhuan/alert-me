import './App.css';
import "antd/dist/antd.css";
import { Select, TimePicker, Button, Input } from 'antd';
import { useState, useEffect, useCallback } from "react";
import dayjs from 'dayjs';

function App() {
  const [dateType, setDateType] = useState('week');
  const [weekDays, setWeekDays] = useState( []);
  const [timeRange, setTimeRange] = useState([]);
  const [step, setStep] = useState(30);
  const [times, setTimes] = useState([]);
  const [info, setInfo] = useState();
  const [alertActive, setAlertActive] = useState();
  const [alertContent, setContent] = useState('');
  const [timeStay, setTimeStay] = useState(10);
  useEffect(() => {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.get('alertTimeInfo', (res) => {
      let obj = res.alertTimeInfo;
      if (obj) {
        setInfo(obj);
        obj.dateType && setDateType(obj.dateType);
        obj.weekDays && obj.weekDays.length && setWeekDays(obj.weekDays || []);
        obj.timeRange && obj.timeRange.length && setTimeRange(obj.timeRange);
        obj.step && setStep(obj.step);
        obj.times && obj.times.length && setTimes(obj.times );
        obj.alertContent && setContent(obj.alertContent);
        obj.timeStay && setTimeStay(obj.timeStay);
        obj.alertActive && setAlertActive(true);
      }
    });
  }, []);


  const setTime = useCallback((time, tStr) => {
    tStr && setTimeRange(tStr.filter(t => t));
  });
  const getDate = useCallback((str = '') => {
    let [h, m, s] = str.split(':');
    return dayjs().set('hour', h).set('minute', m).set('second', s);
  });

  useEffect(() => {
    if (timeRange.length === 2) {
      let arr = [];
      let [startTime, endTime] = timeRange.map(t => getDate(t));
      let start = startTime;
      while(start.isBefore(endTime)) {
        arr.push(start.format('HH:mm:ss'));
        start = start.add(step, 'minute');
      }
      arr.push(endTime.format('HH:mm:ss'));
      setTimes(arr);
    }
    else {
      setTimes([]);
    }

  }, [timeRange, step]);

  const saveAlert = useCallback(() => {
    let obj = {
      alertTimeInfo: {
      dateType,
      weekDays,
      timeRange,
      step,
      times,
      alertContent,
      timeStay,
      alertActive: !!alertActive
    }
  };
    // eslint-disable-next-line no-undef
    chrome.storage.sync.set(obj);
    setInfo(obj.alertTimeInfo);
    alert('????????????');
  }, [times, alertContent, timeStay]);

  const clearAlert = useCallback(() => {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.remove('alertTimeInfo', (res) => {
     setInfo();
     setDateType('week');
     setWeekDays([]);
     setTimeRange([]);
     setStep(30);
     setTimes([]);
     setContent('')
    })
  });

  const toggleAlert = useCallback(() => {
    // eslint-disable-next-line no-undef
    chrome.storage.sync.set({alertTimeInfo: {...(info || {}), alertActive: !alertActive}});
    setAlertActive(!alertActive);
  });

  return (
    <div className="App">
      <div>
        <span className="dropdown-label">????????????</span>
        <Select
          defaultValue={dateType}
          style={{width: 100}}
          options={[
            { label: '??????', value: 'day' },
            { label: '??????', value: 'week' },
          ]}
          onChange={(value) => setDateType(value)}
        />
      </div>
      {dateType === 'week'
        ? <div>
            <span className="dropdown-label">????????????</span>
            <Select
              mode="multiple"
              value={weekDays}
              style={{width: 315}}
              options={[
                { label: '??????', value: 0 },
                { label: '??????', value: 1 },
                { label: '??????', value: 2 },
                { label: '??????', value: 3 },
                { label: '??????', value: 4 },
                { label: '??????', value: 5 },
                { label: '??????', value: 6 },
              ]}
              onChange={(value) => setWeekDays(value.sort())}
            />
          </div>
        : null}
        <div>
          <span className="dropdown-label">????????????</span>
          <TimePicker.RangePicker value={timeRange.map(t => getDate(t))} onChange={(time, tStr) => setTime(time, tStr)} />
        </div>
        <div>
          <span className="dropdown-label">????????????</span>
          <Select
            value={step}
            style={{width: 100}}
            options={[
              { label: '1??????', value: 1 },
              { label: '5??????', value: 5 },
              { label: '15??????', value: 15 },
              { label: '30??????', value: 30 },
              { label: '45??????', value: 45 },
              { label: '60??????', value: 60 },
            ]}
            onChange={(value) => setStep(value)}
          />
        </div>
        <div>
          <span className="dropdown-label">????????????</span>
          <Input.TextArea
            value={alertContent}
            onChange={e => setContent(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </div>
        <div>
          <span className="dropdown-label">????????????</span>
          <Select
            value={timeStay}
            style={{width: 100}}
            options={[
              { label: '1???', value: 1 },
              { label: '5???', value: 5 },
              { label: '10???', value: 10 },
              { label: '15???', value: 15 },
              { label: '30???', value: 30 },
              { label: '1??????', value: 60 },
              { label: '3??????', value: 60 * 3 },
              { label: '5??????', value: 60 * 5 },
            ]}
            onChange={(value) => setTimeStay(value)}
          />
        </div>
        <Button className='button' type="primary" disabled={(dateType === 'week' && !weekDays.length) || !timeRange.length} onClick={() => saveAlert()}>{info ? '??????' : '??????'}??????</Button>
        <Button className='button' type="primary" disabled={!info} onClick={() => toggleAlert()}>{!alertActive ? '??????' : '??????'}??????</Button>
        <Button className='button' type="primary" disabled={!info} onClick={() => clearAlert()}>????????????</Button>
    </div>
  );
}

export default App;
