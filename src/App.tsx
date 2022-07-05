import React, { useCallback, useEffect, useState } from "react";
import { Scene, PointLayer, GaodeMapV2 } from "@antv/l7";
import { useInterval, useMount } from "ahooks";
import { Slider, Card, Button } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import { PauseOutlined, CaretRightOutlined } from "@ant-design/icons";
import moment from "moment";

export default function App() {
  const [data, setData] = useState<any>([]);
  const [time, setTime] = useState(0);
  const [pointLayer, setPointLayer] = useState<PointLayer | null>(null);
  const [interval1, setInterval1] = useState<number | null>(null);
  useMount(async () => {
    const scene = new Scene({
      id: "map",
      map: new GaodeMapV2({
        pitch: 0,
        type: "amap",
        style: "dark",
        center: [120.22613525390624, 36.14896463588831],
        zoom: 10,
      }),
    });

    const layer = new PointLayer();
    layer
      .source([], {
        parser: {
          type: "json",
          x: "lon",
          y: "lat",
        },
      })
      .shape("circle")
      .size("value", [1, 30])
      .color("value", [
        "#34B6B7",
        "#4AC5AF",
        "#5FD3A6",
        "#7BE39E",
        "#A1EDB8",
        "#CEF8D6",
      ])
      .style({
        opacity: 0.5,
        strokeWidth: 0,
      });

    scene.addLayer(layer);

    setPointLayer(layer);

    const data = await (
      await fetch(
        "https://gw.alipayobjects.com/os/bmw-prod/2644525e-7d09-4f05-8254-99ac2e540686.json"
      )
    ).json();

    setData(
      data.map((item: any) => {
        const time = Math.floor(item.time / 100) * 2 + (item.time % 100) / 30;
        return {
          time,
          data: item.data,
        };
      })
    );
  });

  useEffect(() => {
    const timeData = data.find((item: any) => item.time === time)?.data;

    pointLayer?.setData(timeData, {
      parser: {
        type: "json",
        x: "lon",
        y: "lat",
      },
    });
  }, [data, time, pointLayer]);

  const startTime = useCallback(() => {
    if (typeof interval1 === "number") {
      return;
    }
    setInterval1(
      setInterval(() => {
        setTime((time) => {
          return time >= 47 ? 0 : time + 1;
        });
      }, 100)
    );
  }, []);

  const stopTime = () => {
    if (typeof interval1 === "number") {
      clearInterval(interval1);
      setInterval1(null);
    }
  };

  return (
    <div className="App">
      <div id="map"></div>
      <Card
        bodyStyle={{ padding: "8px 16px" }}
        style={{
          position: "absolute",
          bottom: 50,
          width: 300,
          left: `calc(50% - 150px)`,
          zIndex: 10,
          background: "#fff",
          textAlign: "center",
        }}
      >
        <Button
          shape="circle"
          icon={
            typeof interval1 === "number" ? (
              <PauseOutlined />
            ) : (
              <CaretRightOutlined />
            )
          }
          onClick={() => {
            if (typeof interval1 === "number") {
              stopTime();
            } else {
              startTime();
            }
          }}
        ></Button>
        <Slider
          value={time}
          min={0}
          max={47}
          step={1}
          tipFormatter={(value) => {
            console.log(
              moment()
                .startOf("day")
                .add((value ?? 0) * 30 * 60 * 1000)
                .format("HH:mm")
            );

            return moment()
              .startOf("day")
              .add((value ?? 0) * 30 * 60 * 1000)
              .format("HH:mm");
          }}
          onChange={(newTime) => {
            setTime(newTime);
            stopTime();
          }}
        />
      </Card>
    </div>
  );
}
