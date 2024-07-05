document.addEventListener('DOMContentLoaded', (event) => {
    const mqttUsernameInput = document.getElementById('mqttUsername');
    const mqttPasswordInput = document.getElementById('mqttPassword');

    const speedRange = document.getElementById('speed');
    const directionDisplay = document.getElementById('directionDisplay');
    const speedDisplay = document.getElementById('speedDisplay');

    const xAxisElement = document.getElementById('xAxis');
    const yAxisElement = document.getElementById('yAxis');
    const zAxisElement = document.getElementById('zAxis');

    const xVibrationElement = document.getElementById('xVibration');
    const yVibrationElement = document.getElementById('yVibration');
    const zVibrationElement = document.getElementById('zVibration');

    const currentElement = document.getElementById('current');
    const temperatureElement = document.getElementById('temperature');

    let client; // Variable to store MQTT connection
    let errorAlertShown = false; // Flag to track if alert has been shown

    function connectToMQTT() {
        const username = mqttUsernameInput.value.trim();
        const password = mqttPasswordInput.value.trim();

        if (!username || !password) {
            alert('Please enter MQTT username and password!');
            return;
        }

        if (client) {
            client.end(); // End the existing connection if there is one
            client = null;
        }

        client = mqtt.connect('wss://7a3adf123d584eb0b1c891a0cb842c35.s1.eu.hivemq.cloud:8884/mqtt', {
            username: username,
            password: password
        });

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            alert('MQTT connection successful!');
            errorAlertShown = false; // Reset flag on successful connection
            client.subscribe('sensor22a/x_axis');
            client.subscribe('sensor22a/y_axis');
            client.subscribe('sensor22a/z_axis');
            client.subscribe('sensor22a/x_vibration');
            client.subscribe('sensor22a/y_vibration');
            client.subscribe('sensor22a/z_vibration');
            client.subscribe('sensor22a/current');
            client.subscribe('sensor22a/temperature');
            client.subscribe('motor22a/speed'); // Subscribe to speed topic
            client.subscribe('motor22a/direction'); // Subscribe to direction topic
        });

        client.on('error', (error) => {
            console.error('Connection failed:', error);
            if (!errorAlertShown) {
                alert('MQTT connection failed!');
                errorAlertShown = true; // Set flag to true after showing alert
            }
        });

        client.on('offline', () => {
            console.warn('MQTT client went offline');
        });

        client.on('close', () => {
            console.log('MQTT connection closed');
        });

        client.on('message', (topic, message) => {
            console.log('Received message', message.toString(), 'from topic', topic);
            if (topic === 'sensor22a/x_axis') {
                xAxisElement.textContent = message.toString();
            } else if (topic === 'sensor22a/y_axis') {
                yAxisElement.textContent = message.toString();
            } else if (topic === 'sensor22a/z_axis') {
                zAxisElement.textContent = message.toString();
            } else if (topic === 'sensor22a/x_vibration') {
                xVibrationElement.textContent = message.toString();
            } else if (topic === 'sensor22a/y_vibration') {
                yVibrationElement.textContent = message.toString();
            } else if (topic === 'sensor22a/z_vibration') {
                zVibrationElement.textContent = message.toString();
            } else if (topic === 'sensor22a/current') {
                currentElement.textContent = message.toString();
            } else if (topic === 'sensor22a/temperature') {
                temperatureElement.textContent = message.toString();
            } else if (topic === 'motor22a/speed') {
                const speedValue = parseInt(message.toString());
                speedRange.value = speedValue; // Update speed slider value
                speedDisplay.textContent = speedValue; // Update speed display
                console.log('Speed updated to:', message.toString());
            } else if (topic === 'motor22a/direction') {
                highlightDirectionButton(message.toString()); // Call highlight function based on direction value
            }
        });
    }

    // Event listener for MQTT connection button
    const connectButton = document.getElementById('connectButton');
    connectButton.addEventListener('click', connectToMQTT);

    // Function to highlight active direction button based on MQTT value
    function highlightDirectionButton(direction) {
        // Reset all direction buttons to normal state
        const directionButtons = document.querySelectorAll('.direction-button');
        directionButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Highlight button based on direction value received from MQTT
        switch (direction) {
            case '0':
                document.getElementById('stopButton').classList.add('active');
                directionDisplay.textContent = 'Berhenti'; // Update direction display
                break;
            case '1':
                document.getElementById('forwardButton').classList.add('active');
                directionDisplay.textContent = 'Maju'; // Update direction display
                break;
            case '2':
                document.getElementById('backwardButton').classList.add('active');
                directionDisplay.textContent = 'Mundur'; // Update direction display
                break;
            default:
                directionDisplay.textContent = 'Tidak Dikenal'; // Handle unknown direction case
                break;
        }
    }

    // Event listener for Stop button
    const stopButton = document.getElementById('stopButton');
    stopButton.addEventListener('click', () => {
        if (client) {
            client.publish('motor22a/direction', '0'); // Send '0' value to stop
            highlightDirectionButton('0'); // Manually highlight Stop button
            console.log('Direction changed to: Stop');
        } else {
            alert('Please connect to MQTT first!');
        }
    });

    // Event listener for Forward button
    const forwardButton = document.getElementById('forwardButton');
    forwardButton.addEventListener('click', () => {
        if (client) {
            client.publish('motor22a/direction', '1'); // Send '1' value to move forward
            highlightDirectionButton('1'); // Manually highlight Forward button
            console.log('Direction changed to: Forward');
        } else {
            alert('Please connect to MQTT first!');
        }
    });

    // Event listener for Backward button
    const backwardButton = document.getElementById('backwardButton');
    backwardButton.addEventListener('click', () => {
        if (client) {
            client.publish('motor22a/direction', '2'); // Send '2' value to move backward
            highlightDirectionButton('2'); // Manually highlight Backward button
            console.log('Direction changed to: Backward');
        } else {
            alert('Please connect to MQTT first!');
        }
    });

    // Update MQTT when speed changes
    speedRange.addEventListener('input', () => {
        if (client) {
            const speed = speedRange.value;
            client.publish('motor22a/speed', speed);
            speedDisplay.textContent = speed; // Update speed display
            console.log('Speed changed to:', speed);
        } else {
            alert('Please connect to MQTT first!');
        }
    });
});
