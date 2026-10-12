
'use strict';

const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const {
    supabaseUrl,
    supabaseServiceRoleKey,
} = require('./env');

const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
            transport: WebSocket,
        },
    },
);

module.exports = supabase;
