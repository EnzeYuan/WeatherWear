/**
 * 雪花算法ID生成器
 * 生成64位的唯一ID
 * 格式：1位符号位 + 41位时间戳 + 10位机器ID + 12位序列号
 */

class Snowflake {
  constructor(machineId = 1, datacenterId = 1) {
    // 机器ID (5位)
    this.machineId = machineId & 0x1f; // 0-31
    // 数据中心ID (5位)
    this.datacenterId = datacenterId & 0x1f; // 0-31
    // 序列号 (12位)
    this.sequence = 0;
    // 起始时间戳 (2024-01-01 00:00:00)
    this.twepoch = 1704067200000n;
    // 时间戳位数
    this.timestampBits = 41n;
    // 机器ID位数
    this.machineIdBits = 5n;
    // 数据中心ID位数
    this.datacenterIdBits = 5n;
    // 序列号位数
    this.sequenceBits = 12n;
    // 最大值
    this.maxMachineId = -1n ^ (-1n << this.machineIdBits);
    this.maxDatacenterId = -1n ^ (-1n << this.datacenterIdBits);
    this.maxSequence = -1n ^ (-1n << this.sequenceBits);
    // 左移位数
    this.machineIdShift = this.sequenceBits;
    this.datacenterIdShift = this.sequenceBits + this.machineIdBits;
    this.timestampLeftShift = this.sequenceBits + this.machineIdBits + this.datacenterIdBits;
    // 上次生成ID的时间戳
    this.lastTimestamp = -1n;
  }

  /**
   * 生成下一个ID
   */
  nextId() {
    let timestamp = this.timeGen();

    // 如果当前时间小于上一次ID生成的时间戳，说明系统时钟回退过，需要抛出异常
    if (timestamp < this.lastTimestamp) {
      throw new Error(
        `时钟回退。拒绝在 ${this.lastTimestamp - timestamp} 毫秒内生成ID`
      );
    }

    // 如果是同一时间生成的，则进行毫秒内序列
    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1n) & this.maxSequence;
      // 毫秒内序列溢出
      if (this.sequence === 0n) {
        // 阻塞到下一个毫秒,获得新的时间戳
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      // 时间戳改变，毫秒内序列重置
      this.sequence = 0n;
    }

    // 上次生成ID的时间戳
    this.lastTimestamp = timestamp;

    // 移位并通过或运算拼到一起组成64位的ID
    const id =
      ((timestamp - this.twepoch) << this.timestampLeftShift) |
      (BigInt(this.datacenterId) << this.datacenterIdShift) |
      (BigInt(this.machineId) << this.machineIdShift) |
      this.sequence;

    return id.toString();
  }

  /**
   * 阻塞到下一个毫秒，直到获得新的时间戳
   */
  tilNextMillis(lastTimestamp) {
    let timestamp = this.timeGen();
    while (timestamp <= lastTimestamp) {
      timestamp = this.timeGen();
    }
    return timestamp;
  }

  /**
   * 返回以毫秒为单位的当前时间
   */
  timeGen() {
    return BigInt(Date.now());
  }
}

// 创建单例实例
const snowflake = new Snowflake(1, 1);

/**
 * 生成雪花ID
 */
function generateSnowflakeId() {
  return snowflake.nextId();
}

module.exports = {
  Snowflake,
  generateSnowflakeId
};

