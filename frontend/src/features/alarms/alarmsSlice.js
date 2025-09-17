// src/features/alarms/alarmsSlice.js
import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { getAlarmsHistory } from '../../api/alarmsApi';

export const fetchAlarmsHistory = createAsyncThunk('alarms/fetchHistory', async () => {
    const response = await getAlarmsHistory();
    return response.data;
});

const initialState = {
    active: [],
    history: [],
    status: 'idle',
};

const alarmsSlice = createSlice({
    name: 'alarms',
    initialState,
    reducers: {
        // از یک "prepare callback" برای افزودن ID استفاده می‌کنیم
        addActiveAlarm: {
            reducer(state, action) {
                // حالا action.payload ما همیشه یک ID منحصربه‌فرد دارد
                state.active.unshift(action.payload);
            },
            prepare(alarmData) {
                // این تابع قبل از ردیوسر اصلی اجرا می‌شود.
                // ما یک آبجکت جدید با یک id منحصربه‌فرد ایجاد می‌کنیم.
                return {
                    payload: {
                        id: nanoid(), // یک ID منحصربه‌فرد با nanoid ایجاد می‌شود
                        ...alarmData, // بقیه داده‌های آلارم اصلی به آن اضافه می‌شود
                    }
                };
            }
        },
        acknowledgeAlarm: (state, action) => {
            const alarmToAck = state.active.find(a => a.id === action.payload);
            if (alarmToAck) {
                alarmToAck.acknowledged = true;
                state.history.unshift(alarmToAck);
                state.active = state.active.filter(a => a.id !== action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAlarmsHistory.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchAlarmsHistory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.active = action.payload.filter(a => !a.acknowledged);
                state.history = action.payload.filter(a => a.acknowledged);
            });
    },
});

export const { addActiveAlarm, acknowledgeAlarm } = alarmsSlice.actions;
export default alarmsSlice.reducer;