Java.perform(function () {
    var BleManager = Java.use("com.vinsol.loreal.PersoLips.utils.BleManager");

    // Save original method
    var originalSend = BleManager.send.overload('[B', 'int');

    function enumerateObject(obj) {
        try {
            var objClass = obj.getClass();
            console.log("Object class: " + objClass.getName());

            var fields = objClass.getDeclaredFields();
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                field.setAccessible(true);
                try {
                    var name = field.getName();
                    var value = field.get(obj);
                    console.log("  Name: " + name + " = " + value);
                } catch (err) {
                    console.log(" Could not access field: " + err);
                }
            }
        } catch (err) {
            console.log("Error during enumeration: " + err);
        }
    }

    BleManager.send.overload('[B', 'int').implementation = function (bArr, i) {
        console.log("send() called with device ID: " + i);

        // Print hex of byte array
        var bytes = Java.array('byte', bArr);
        var hex = Array.from(bytes).map(function (b) {
            return ('0' + (b & 0xFF).toString(16)).slice(-2);
        }).join(' ');
        console.log("Payload (hex): " + hex);

        // Inspect `this` object (BleManager instance)
        console.log("Enumerating fields of BleManager instance...");
        enumerateObject(this);

        // Call original
        return originalSend.call(this, bArr, i);
    };
});
