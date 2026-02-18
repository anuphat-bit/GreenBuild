const handleCheckout = async () => {
    if (cart.length === 0) return;

    // เตรียมข้อมูลให้ตรงกับหัวตารางใน Google Sheets
    const itemsToUpload = cart.map(item => ({
      id: item.id,
      timestamp: new Date().toLocaleString('th-TH'),
      userName: item.userName || localStorage.getItem('greenbuild_user_name'),
      userId: item.department || localStorage.getItem('greenbuild_department'),
      name: item.name,      // ชื่อสินค้า
      amount: item.amount,  // จำนวน
      unit: item.unit,      // หน่วย
      category: item.isGreen ? 'GREEN' : 'NORMAL',
      status: 'PENDING'
    }));

    try {
      // ส่งข้อมูลเข้า SheetDB
      const response = await fetch('https://sheetdb.io/api/v1/0zxc9i3e6gg1z', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: itemsToUpload })
      });

      if (response.ok) {
        const updatedOrders = [...orders, ...cart];
        setOrders(updatedOrders);
        localStorage.setItem('greenbuild_orders', JSON.stringify(updatedOrders));
        setCart([]); // ล้างตะกร้า
        setCurrentView('USER_ORDERS'); // ไปหน้าประวัติการสั่งซื้อ
        alert('สั่งซื้อสำเร็จและบันทึกข้อมูลแล้ว!');
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  };
