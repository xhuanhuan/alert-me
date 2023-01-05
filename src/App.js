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
    alert('设置成功');
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
        <span className="dropdown-label">时间类型</span>
        <Select
          defaultValue={dateType}
          style={{width: 100}}
          options={[
            { label: '每天', value: 'day' },
            { label: '每周', value: 'week' },
          ]}
          onChange={(value) => setDateType(value)}
        />
      </div>
      {dateType === 'week'
        ? <div>
            <span className="dropdown-label">星期粒度</span>
            <Select
              mode="multiple"
              value={weekDays}
              style={{width: 315}}
              options={[
                { label: '周一', value: 0 },
                { label: '周二', value: 1 },
                { label: '周三', value: 2 },
                { label: '周四', value: 3 },
                { label: '周五', value: 4 },
                { label: '周六', value: 5 },
                { label: '周日', value: 6 },
              ]}
              onChange={(value) => setWeekDays(value.sort())}
            />
          </div>
        : null}
        <div>
          <span className="dropdown-label">时间范围</span>
          <TimePicker.RangePicker value={timeRange.map(t => getDate(t))} onChange={(time, tStr) => setTime(time, tStr)} />
        </div>
        <div>
          <span className="dropdown-label">时间间隔</span>
          <Select
            value={step}
            style={{width: 100}}
            options={[
              { label: '1分钟', value: 1 },
              { label: '5分钟', value: 5 },
              { label: '15分钟', value: 15 },
              { label: '30分钟', value: 30 },
              { label: '45分钟', value: 45 },
              { label: '60分钟', value: 60 },
            ]}
            onChange={(value) => setStep(value)}
          />
        </div>
        <div>
          <span className="dropdown-label">提醒内容</span>
          <Input.TextArea
            value={alertContent}
            onChange={e => setContent(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </div>
        <div>
          <span className="dropdown-label">提醒时长</span>
          <Select
            value={timeStay}
            style={{width: 100}}
            options={[
              { label: '1秒', value: 1 },
              { label: '5秒', value: 5 },
              { label: '10秒', value: 10 },
              { label: '15秒', value: 15 },
              { label: '30秒', value: 30 },
              { label: '1分钟', value: 60 },
              { label: '3分钟', value: 60 * 3 },
              { label: '5分钟', value: 60 * 5 },
            ]}
            onChange={(value) => setTimeStay(value)}
          />
        </div>
        <Button className='button' type="primary" disabled={(dateType === 'week' && !weekDays.length) || !timeRange.length} onClick={() => saveAlert()}>{info ? '更新' : '保存'}数据</Button>
        <Button className='button' type="primary" disabled={!info} onClick={() => toggleAlert()}>{!alertActive ? '启动' : '禁用'}提醒</Button>
        <Button className='button' type="primary" disabled={!info} onClick={() => clearAlert()}>清空数据</Button>
    </div>
  );
}

export default App;
