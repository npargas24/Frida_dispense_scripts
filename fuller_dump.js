Java.perform(function () {
    var BeamLipsController = Java.use("com.vinsol.loreal.PersoLips.utils.BeamLipsController");
    var BleManager = Java.use("com.vinsol.loreal.PersoLips.utils.BleManager")
    var BleManagerAnonClass = Java.use("com.vinsol.loreal.PersoLips.utils.BleManager$1") // $1 represents Anonymous Class 1
    var BluetoothGattCharacteristic = Java.use("android.bluetooth.BluetoothGattCharacteristic");
    var CommandExecutor = Java.use("com.vinsol.loreal.PersoLips.utils.CommandExecutor");
    var Base64 = Java.use("android.util.Base64");
    var Color = Java.use("android.graphics.Color");
    var Log = Java.use("android.util.Log");
    var Exception = Java.use("java.lang.Exception");
    var Throwable = Java.use("java.lang.Throwable");
    var ByteBuffer = Java.use("java.nio.ByteBuffer");
    var Integer = Java.use("java.lang.Integer");

    // Save original methods
    var originalOnCharacteristicChanged = BleManagerAnonClass.onCharacteristicChanged.overload('android.bluetooth.BluetoothGatt',
     'android.bluetooth.BluetoothGattCharacteristic');

    var originalSend = BleManager.send.overload('[B', 'int');


    function floatToBytes(f) {
        const bb = ByteBuffer.allocate(4);
        bb.putFloat(f);
        return Java.array('byte', bb.array());
    }

    function intToBytes(i) {
        const bb = ByteBuffer.allocate(4);
        bb.putInt(i);
        return Java.array('byte', bb.array());
    }


     function toHex(bytes) {
        return Array.from(bytes).map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join(' ');
    }

    function tryCall(obj, methodName) {
        try {
            return obj[methodName]();
        } catch (e) {
            return "(error)";
        }
    }

    function dumpShade(shade) {
        try {
            const shadeClass = shade.getClass().getName();
            console.log("  Shade class: " + shadeClass);
        }
        catch(err) {
            console.log("  Could not get shade info: " + err);
        }
        
        var hex = tryCall(shade, 'getShadeColorHex')|| "(null)";
        console.log(" Color Hex: " + hex);
    }

        function colorToHex(colorObj) {
        try {
            const argb = colorObj.toArgb();
            const a = (argb >> 24) & 0xFF;
            const r = (argb >> 16) & 0xFF;
            const g = (argb >> 8) & 0xFF;
            const b = argb & 0xFF;
            const hex = [a, r, g, b].map(x => ('0' + x.toString(16)).slice(-2)).join(' ');
            return `ARGB: ${argb} | Bytes: ${hex}`;
        } catch (e) {
            return `Error reading color: ${e}`;
        }
    }

        function logObjectFields(obj) {
        if (!obj) return;
        try {
            const clazz = obj.getClass();
            const fields = clazz.getDeclaredFields();
            console.log("  [Fields of " + clazz.getName() + "]:");
            for (let i = 0; i < fields.length; i++) {
                const f = fields[i];
                f.setAccessible(true);
                const name = f.getName();
                const value = f.get(obj);
                console.log("    " + name + " = " + value);
            }
        } catch (e) {
            console.log("  Error accessing fields: " + e);
        }
    }

     // Hook dispenseFor(...)
    BeamLipsController.dispenseFor.overload(
        'int', 'java.lang.String', 'int', 'int', 'int', 'float', 'int'
    ).implementation = function (deviceId, colorUniverse, r, g, b, vol, dose) {
        console.log("\n--- dispenseFor(...) called ---");
        console.log("  Device ID: " + deviceId.toString(16));
        console.log("  Color Universe: " + colorUniverse);
        console.log("  Red: " + r + " | Green: " + g + " | Blue: " + b);
        console.log("  Volume (float): " + vol + " → " + toHex(floatToBytes(vol)));
        console.log("  Dose (int): " + dose + " → " + toHex(intToBytes(dose)));
        console.log("  Call Stack (starting with exception):\n" + Log.getStackTraceString(Exception.$new()));
        logObjectFields(this);

        return this.dispenseFor(deviceId, colorUniverse, r, g, b, vol, dose);
    };

    // Hook onDispensing
    BeamLipsController.onDispensing.implementation = function (deviceId, recipeId, vol0, color0, vol1, color1, vol2, color2) {
        console.log("\n--------- BeamLipsController.onDispensing() called ---------");
        console.log("  recipeId: " + recipeId);
        console.log("  vol0: " + vol0 + " | color0: " + colorToHex(color0));
        console.log("  vol1: " + vol1 + " | color1: " + colorToHex(color1));
        console.log("  vol2: " + vol2 + " | color2: " + colorToHex(color2));
        console.log("  Call Stack (starting with exception):\n" + Log.getStackTraceString(Throwable.$new()));

        return this.onDispensing(deviceId, recipeId, vol0, color0, vol1, color1, vol2, color2);
    };

    // Hook getDispenseVolumeAndApplicationDose
    CommandExecutor.getDispenseVolumeAndApplicationDose.overload('float').implementation = function (vol) {
    const result = this.getDispenseVolumeAndApplicationDose(vol);
    console.log("------------ getDispenseVolumeAndApplicationDose(...) called ------------");
    console.log("  Input Volume: " + vol);
    console.log("  Result → float: " + result.component1() + ", int: " + result.component2());
    return result;
};

        // Hook CommandExecutor.executeDispenseCommand 
    CommandExecutor.executeDispenseCommand.overload(
        'com.vinsol.loreal.PersoLips.models.realmModel.Shade', 'float'
    ).implementation = function (shade, volume) {
        console.log("\n------------- executeDispenseCommand(...) called -------------");
        dumpShade(shade);

        try {
            const Pair = Java.use('kotlin.Pair');
            const pair = this.getDispenseVolumeAndApplicationDose(volume);
            const floatVolume = pair.component1();
            const intDose = pair.component2();

            console.log("  Input Volume: " + volume);
            console.log("  Computed float volume: " + floatVolume);
            console.log("  Computed int dose: " + intDose);
        } catch (err) {
            console.log(" Error extracting volume/dose: " + err);
        }

        console.log("  Call Stack:\n" + Log.getStackTraceString(Exception.$new()));
        
        const result = this.executeDispenseCommand(shade, volume);
        return result;
    };

        // Hook BleManager.send
    originalSend.implementation = function (bArr, deviceId) {
        const bytes = Java.array('byte', bArr);
        const List = Array.from(bytes).map(b => b < 0 ? b + 256 : b);

        console.log("\n------------ BleManager.send(...) called ------------------");
        console.log("  Device ID: " + deviceId + " (hex: " + deviceId.toString(16) + ")");
        console.log(" bytes (hex): " + List.map(b => ('0' + b.toString(16)).slice(-2)).join(' '));
        console.log("  Call Stack:\n" + Log.getStackTraceString(Exception.$new()));
        logObjectFields(this);

        return originalSend.call(this, bArr, deviceId);
    };

        // Hook BleManager.onCharacteristicChanged
    BleManagerAnonClass.onCharacteristicChanged.implementation = function(gatt, characteristic) {
        console.log(" ---------- onCharacteristicChanged called ----------------");
          
        var frame = characteristic.getValue();
        var hex = toHex(frame);

        console.log("  Received frames: " + hex);
        console.log("  Call Stack:\n" + Log.getStackTraceString(Exception.$new()));
        logObjectFields(this);

        return originalOnCharacteristicChanged.call(this, gatt, characteristic);
     };    


});