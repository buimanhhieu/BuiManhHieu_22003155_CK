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
      const tableInfo = await db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='movies'"
      );
      
      if (tableInfo.length > 0) {
        const movieCount = await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) as count FROM movies"
        );
        setDbStatus(`Database connected. Movies table exists. ${movieCount?.count || 0} movie(s) found.`);
      } else {
        setDbStatus("Database connected but movies table not found");
      }
    } catch (error) {
      setDbStatus("Database connection failed");
      console.error("Database error:", error);
    }
  };

  const testDatabase = async () => {
    try {
      const movies = await db.getAllAsync("SELECT * FROM movies");
      setTestResult(` Found ${movies.length} movie(s) in database.`);
    } catch (error) {
      setTestResult(` Test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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

