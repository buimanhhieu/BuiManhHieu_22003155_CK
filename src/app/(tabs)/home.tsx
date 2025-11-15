import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Button, Card } from "react-native-paper";

const HomeScreen = () => {
  const db = useSQLiteContext();
  const [dbStatus, setDbStatus] = useState<string>("Checking...");
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      const result = await db.getFirstAsync<{ count: number }>(
        "SELECT 1 as count"
      );
      if (result) {
        setDbStatus("✅ Database connected successfully");
      }
    } catch (error) {
      setDbStatus("Database connection failed");
      console.error("Database error:", error);
    }
  };

  const testDatabase = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at INTEGER
        )
      `);

      await db.runAsync(
        "INSERT INTO test_table (name, created_at) VALUES (?, ?)",
        ["Test Item", Date.now()]
      );

      const items = await db.getAllAsync("SELECT * FROM test_table");
      
      await db.runAsync("DELETE FROM test_table");

      setTestResult(`✅ Test passed! Created and deleted test data. Found ${items.length} item(s).`);
    } catch (error) {
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Test error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Database Connection Test</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={styles.statusText}>{dbStatus}</Text>
          </View>

          <Button
            mode="contained"
            onPress={testDatabase}
            style={styles.button}
          >
            Test Database Operations
          </Button>

          {testResult ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{testResult}</Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  statusContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
  },
  button: {
    marginTop: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomeScreen;

